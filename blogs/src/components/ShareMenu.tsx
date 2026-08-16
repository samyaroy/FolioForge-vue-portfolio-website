import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  buildShareUrl,
  claimOpenShareMenu,
  copyText,
  imageFileName,
  openShare,
  releaseOpenShareMenu,
  resolveShareTargets,
  saveImage,
  shareMessage,
  type ImageHandoff,
  type ShareContent,
  type ShareTarget,
} from '@shared/shareTargets'

// React counterpart of the portfolio's src/components/ShareMenu.vue. Both are
// presentation only: which networks exist and what each one is handed is
// decided in shared/shareTargets.ts, so the two menus cannot disagree.

const MENU_WIDTH = 208
const VIEWPORT_GAP = 8
const STATUS_TIMEOUT_MS = 6000
const COPIED_TIMEOUT_MS = 2500

const IMAGE_NOTE: Record<ImageHandoff, string> = {
  downloaded: 'Image saved to your downloads',
  opened: 'Image opened in a new tab — save it from there',
  failed: 'Could not fetch the image — save it from the zoom view',
}

type ShareMenuProps = {
  content: ShareContent
  /** Classes for the trigger button, so it can match whatever hosts it. */
  triggerClass?: string
  triggerLabel?: string
  heading?: string
  /** Size class for the trigger's icon, which differs per host. */
  triggerIconClass?: string
  /** Visible text beside the icon. Omitted where the trigger is icon-only, as
      it is on a gallery card's image overlay. */
  triggerText?: string
}

export function ShareMenu({
  content,
  triggerClass = '',
  triggerLabel = 'Share',
  heading = 'Share',
  triggerIconClass = 'text-base',
  triggerText,
}: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const statusTimer = useRef<number | null>(null)
  const copiedTimer = useRef<number | null>(null)

  const targets = resolveShareTargets(content)
  // Stable across renders, so it can be used as this menu's identity in the
  // one-open-menu registry.
  const closeMenu = useCallback(() => setIsOpen(false), [])

  // Measured after the menu is in the DOM, since where it opens depends on its
  // own height: below the trigger normally, above it near the viewport bottom.
  // Re-runs on statusMessage too — the status line changes that height, and a
  // menu that opened upwards would otherwise grow off the bottom of the screen.
  useLayoutEffect(() => {
    if (!isOpen) return

    function positionMenu() {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const menuHeight = menuRef.current?.offsetHeight ?? 320
      const maxLeft = Math.max(VIEWPORT_GAP, window.innerWidth - MENU_WIDTH - VIEWPORT_GAP)
      // Right-aligned to the trigger, then pulled back inside the viewport — the
      // button often sits at the right edge of a card at the edge of the grid.
      const left = Math.min(Math.max(VIEWPORT_GAP, rect.right - MENU_WIDTH), maxLeft)
      const fitsBelow = rect.bottom + VIEWPORT_GAP + menuHeight <= window.innerHeight
      const fitsAbove = rect.top - VIEWPORT_GAP - menuHeight >= 0
      const top =
        fitsBelow || !fitsAbove
          ? rect.bottom + VIEWPORT_GAP
          : rect.top - VIEWPORT_GAP - menuHeight

      setPosition({ top, left })
    }

    positionMenu()
    window.addEventListener('resize', positionMenu)
    // Capture phase, so scrolls inside containers are seen too.
    window.addEventListener('scroll', positionMenu, true)

    return () => {
      window.removeEventListener('resize', positionMenu)
      window.removeEventListener('scroll', positionMenu, true)
    }
  }, [isOpen, statusMessage])

  useEffect(() => {
    if (!isOpen) return

    // Closes whichever share menu was open before this one.
    claimOpenShareMenu(closeMenu)

    function handleDocumentClick(event: MouseEvent) {
      const target = event.target as Node | null
      if (
        target &&
        (menuRef.current?.contains(target) || triggerRef.current?.contains(target))
      ) {
        return
      }

      setIsOpen(false)
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return

      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleKeydown)

    return () => {
      releaseOpenShareMenu(closeMenu)
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [isOpen, closeMenu])

  useEffect(
    () => () => {
      if (statusTimer.current) window.clearTimeout(statusTimer.current)
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
    },
    [],
  )

  function setStatus(message: string) {
    setStatusMessage(message)
    if (statusTimer.current) window.clearTimeout(statusTimer.current)
    statusTimer.current = window.setTimeout(() => setStatusMessage(''), STATUS_TIMEOUT_MS)
  }

  async function copyLink() {
    if (!(await copyText(content.url))) {
      setStatus('Could not reach the clipboard — copy the link from the address bar.')
      return
    }

    setHasCopied(true)
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => setHasCopied(false), COPIED_TIMEOUT_MS)
  }

  /**
   * Instagram has no share endpoint to open, so the hand-off is the image plus
   * the caption; see saveImage() in shared/shareTargets.ts. Both run at once so
   * the clipboard write does not spend the click's transient activation, which
   * the image fallback needs in order to open a tab.
   */
  async function handOffToInstagram() {
    if (!content.imageUrl) return

    setIsBusy(true)

    try {
      const [captionCopied, handoff] = await Promise.all([
        copyText(`${shareMessage(content)}\n${content.url}`),
        saveImage(content.imageUrl, imageFileName(content.imageUrl, content.title)),
      ])

      setStatus(
        captionCopied
          ? `${IMAGE_NOTE[handoff]}. Caption copied — paste it into Instagram.`
          : `${IMAGE_NOTE[handoff]}. The caption could not be copied automatically.`,
      )
    } finally {
      setIsBusy(false)
    }
  }

  function activateTarget(target: ShareTarget) {
    if (target.kind === 'link') {
      openShare(buildShareUrl(target.id, content))
      setIsOpen(false)
      return
    }

    void (target.id === 'copy' ? copyLink() : handOffToInstagram())
  }

  function labelFor(target: ShareTarget) {
    if (target.id === 'copy' && hasCopied) return 'Link copied'
    if (target.id === 'instagram' && isBusy) return 'Preparing image…'

    return target.label
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClass}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation()
          if (!isOpen) setStatusMessage('')
          setIsOpen((open) => !open)
        }}
      >
        <span
          className={`mdi mdi-share-variant leading-none ${triggerIconClass}`}
          aria-hidden="true"
        />
        {triggerText && <span>{triggerText}</span>}
      </button>

      {/* Portalled because every card that hosts this button clips its own
          overflow; a popover inside one would be cut off at the card edge. */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[60] w-52 overflow-hidden rounded-[10px] bg-white shadow-[0_18px_42px_-10px_rgba(14,20,27,0.32)] ring-1 ring-slate-900/10"
            style={{ top: position.top, left: position.left }}
            role="menu"
            aria-label={triggerLabel}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="truncate border-b border-slate-100 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
              {heading}
            </p>

            <ul className="p-1">
              {targets.map((target) => (
                <li key={target.id}>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-[6px] bg-transparent px-2 py-1.5 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none disabled:opacity-60"
                    disabled={isBusy}
                    onClick={() => activateTarget(target)}
                  >
                    <span
                      className={`mdi text-base leading-none ${
                        target.id === 'copy' && hasCopied
                          ? 'mdi-check text-emerald-500'
                          : `${target.icon} ${target.colorClass}`
                      }`}
                      aria-hidden="true"
                    />
                    <span>{labelFor(target)}</span>
                  </button>
                </li>
              ))}
            </ul>

            {statusMessage && (
              <p className="border-t border-slate-100 px-2.5 py-1.5 text-[10px] leading-[14px] text-slate-500">
                {statusMessage}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}
