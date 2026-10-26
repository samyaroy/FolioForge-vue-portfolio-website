import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Minus, Plus, ScanLine } from 'lucide-react'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
// A same-origin URL, never a blob: a worker made from a blob inherits nothing
// the page policy can vouch for (cv_architecture.md §8.4).
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { IconButton } from '@/components/form'

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]
// Breathing room either side of a page in fit-width mode.
const PAGE_GUTTER = 28

type Zoom = number | 'fit'

/**
 * The compiled PDF, drawn by PDF.js onto one <canvas> per page. PDF.js loads
 * only when a PDF first arrives, so the rest of the admin never downloads it.
 * Its WebAssembly decoders stay off: the page policy blocks them, and a CV has
 * no images that need them.
 */
export function PdfPreview({ pdf }: { pdf: Uint8Array }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [baseWidth, setBaseWidth] = useState(612)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState<Zoom>('fit')
  const [width, setWidth] = useState(0)
  const [page, setPage] = useState(1)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    void import('pdfjs-dist')
      .then(pdfjs => {
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
        // PDF.js hands the buffer to its worker, so it gets a copy and the
        // caller keeps the original for Download PDF.
        return pdfjs.getDocument({ data: pdf.slice(), useWasm: false, enableXfa: false }).promise
      })
      .then(async next => {
        if (cancelled) return void next.loadingTask.destroy()
        const first = await next.getPage(1)
        setBaseWidth(first.getViewport({ scale: 1 }).width)
        setDoc(next)
        setError(null)
      })
      .catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : 'The PDF could not be read.') })
    return () => { cancelled = true }
  }, [pdf])

  // Each document is destroyed once the next one replaces it, never before, so
  // the old pages stay up while a new compile loads.
  useEffect(() => () => { void doc?.loadingTask.destroy() }, [doc])

  useEffect(() => {
    const element = scroller.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const scale = zoom === 'fit' ? Math.max(width - PAGE_GUTTER, 200) / baseWidth : zoom
  const pages = doc?.numPages ?? 0

  const pageElements = () => [...(scroller.current?.querySelectorAll<HTMLCanvasElement>('canvas[data-page]') ?? [])]
  const showPage = (target: number) => pageElements()[target - 1]?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  const trackPage = () => {
    const top = scroller.current?.getBoundingClientRect().top ?? 0
    const above = pageElements().filter(canvas => canvas.getBoundingClientRect().top - top <= 40).length
    setPage(Math.max(above, 1))
  }
  const zoomBy = (direction: 1 | -1) => {
    const current = zoom === 'fit' ? scale : zoom
    const next = direction > 0 ? ZOOM_STEPS.find(step => step > current + 0.01) : [...ZOOM_STEPS].reverse().find(step => step < current - 0.01)
    if (next) setZoom(next)
  }

  return (
    <div className="cv-pdf">
      <div className="cv-pdf-toolbar">
        <span className="cv-pdf-pages">
          <IconButton label="Previous page" size="icon-xs" disabled={page <= 1} onClick={() => showPage(page - 1)}><ChevronLeft /></IconButton>
          <span>{pages ? `${Math.min(page, pages)} / ${pages}` : '–'}</span>
          <IconButton label="Next page" size="icon-xs" disabled={page >= pages} onClick={() => showPage(page + 1)}><ChevronRight /></IconButton>
        </span>
        <span className="cv-pdf-zoom">
          <IconButton label="Zoom out" size="icon-xs" onClick={() => zoomBy(-1)}><Minus /></IconButton>
          <span>{Math.round(scale * 100)}%</span>
          <IconButton label="Zoom in" size="icon-xs" onClick={() => zoomBy(1)}><Plus /></IconButton>
          <IconButton label="Fit to width" size="icon-xs" variant={zoom === 'fit' ? 'secondary' : 'ghost'} onClick={() => setZoom('fit')}><ScanLine /></IconButton>
        </span>
      </div>
      <div ref={scroller} className="cv-pdf-pages-scroll" onScroll={trackPage}>
        {error && <p className="cv-pdf-message">{error}</p>}
        {doc && Array.from({ length: pages }, (_, index) => <PdfPage key={index} doc={doc} number={index + 1} scale={scale} />)}
      </div>
    </div>
  )
}

function PdfPage({ doc, number, scale }: { doc: PDFDocumentProxy; number: number; scale: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    let task: RenderTask | null = null
    void doc.getPage(number).then(page => {
      const element = canvas.current
      if (cancelled || !element) return
      const viewport = page.getViewport({ scale })
      const ratio = window.devicePixelRatio || 1
      element.width = Math.floor(viewport.width * ratio)
      element.height = Math.floor(viewport.height * ratio)
      element.style.width = `${Math.floor(viewport.width)}px`
      element.style.height = `${Math.floor(viewport.height)}px`
      task = page.render({ canvas: element, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] })
      return task.promise
    }).catch((reason: unknown) => {
      // A newer scale or document cancels the render it replaces.
      if (!(reason instanceof Error && reason.name === 'RenderingCancelledException')) console.error(reason)
    })
    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [doc, number, scale])

  return <canvas ref={canvas} data-page={number} className="cv-pdf-page" aria-label={`Page ${number}`} />
}
