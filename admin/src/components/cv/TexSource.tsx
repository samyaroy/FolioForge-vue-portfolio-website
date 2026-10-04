import { Copy, Download } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/form'
import { downloadText } from '@/lib/download'

/**
 * The generated LaTeX, read-only, with line numbers so a compile error's line
 * can be found. It always reflects the configuration beside it.
 */
export function TexSource({ tex, filename }: { tex: string; filename: string }) {
  const lines = tex.split('\n')
  const copy = () => navigator.clipboard.writeText(tex).then(() => toast.success('LaTeX copied.'), () => toast.error('The browser would not copy.'))
  return (
    <section className="cv-panel cv-source" aria-label="Generated LaTeX">
      <div className="cv-panel-heading">
        <div><span>Source</span><h2>{filename}.tex</h2></div>
        <div className="cv-panel-actions">
          <Button variant="outline" size="sm" onClick={() => void copy()}><Copy aria-hidden="true" />Copy</Button>
          <Button variant="outline" size="sm" onClick={() => downloadText(`${filename}.tex`, tex)}><Download aria-hidden="true" />Download .tex</Button>
        </div>
      </div>
      <pre className="cv-tex"><code>{lines.map((line, index) => <span key={index}>{line}{'\n'}</span>)}</code></pre>
      <p className="cv-panel-foot">{lines.length} lines · generated from the configuration, so edit it there</p>
    </section>
  )
}
