import { type RefObject } from 'react'
import { ArrowRight, Bold, IndentIncrease, Italic, Underline } from 'lucide-react'
import { IconButton } from '@/components/form'
import type { Emphasis } from '../../../../src/utils/inlineMarkup'
import { CROSS_REFERENCE_PREFIX, hasCrossReference, stripCrossReference, writeCrossReference } from '../../../../src/utils/crossReference'

/**
 * Bold, italic and underline for a single-line authored field.
 *
 * The markers are the ones SmartLink renders on the site — doubling for bold
 * and underline, single for italic — so what is typed here is what a visitor
 * sees. Markdown's own underscore italic is deliberately absent: it would
 * catch snake_case words that content legitimately contains.
 */
const CONTROLS = [
  { mark: 'bold', label: 'Bold', hint: 'Bold (**text**)', icon: Bold },
  { mark: 'italic', label: 'Italic', hint: 'Italic (*text*)', icon: Italic },
  { mark: 'underline', label: 'Underline', hint: 'Underline (__text__)', icon: Underline },
] as const

type Marks = Required<Emphasis>

const NO_MARKS: Marks = { bold: false, italic: false, underline: false }

type FormattingToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
  /** Distinguishes one line's toolbar from the next for screen readers. */
  context: string
  /**
   * SUB-BULLET FEATURE (unused). Makes the whole line a sub-bullet of the line
   * above. It is a property of the line rather than of the words in it, so it
   * sits apart from the three that mark up a selection. Optional, so removing
   * the feature means deleting this prop and the button below.
   */
  subBullet?: { active: boolean; onToggle: () => void }
  /**
   * Offers the trailing @see that links the line to another page. Like the
   * sub-bullet it belongs to the line rather than to a selection, and it only
   * makes sense where the line is drawn with one, so it is opt-in.
   */
  crossReference?: boolean
}

export function FormattingToolbar({ textareaRef, value, onChange, context, subBullet, crossReference }: FormattingToolbarProps) {
  const apply = (next: string, selectionStart: number, selectionEnd: number) => {
    onChange(next)
    // After React has written the new value, or the caret lands in the old one.
    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.focus()
      textarea.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  const toggle = (mark: keyof Marks) => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Markers already around the words are read as one fence and rewritten as
    // one. They share characters — * opens italic and ** bold, and a fence can
    // hold both — so taking one mark off means reading the whole fence rather
    // than the two characters nearest the selection.
    let start = textarea.selectionStart
    let end = textarea.selectionEnd
    while (start < end && isDelimiter(value[start])) start += 1
    while (end > start && isDelimiter(value[end - 1])) end -= 1

    const selected = value.slice(start, end)
    const leftFence = /[*_]*$/.exec(value.slice(0, start))?.[0] ?? ''
    const rightFence = /^[*_]*/.exec(value.slice(end))?.[0] ?? ''
    const opening = readFence(leftFence)
    const closing = readFence(rightFence)

    // Only a fence this understands, and that closes the way it opened, is
    // rewritten; anything else is left exactly as authored and wrapped around.
    const enclosing = opening && closing && sameMarks(opening, closing) ? opening : null
    const marks = { ...(enclosing ?? NO_MARKS), [mark]: !enclosing?.[mark] }
    const head = enclosing
      ? `${value.slice(0, start - leftFence.length)}${writeFence(marks, 'opening')}`
      : `${value.slice(0, start)}${writeFence(marks, 'opening')}`
    const tail = enclosing
      ? `${writeFence(marks, 'closing')}${value.slice(end + rightFence.length)}`
      : `${writeFence(marks, 'closing')}${value.slice(end)}`

    // With nothing selected this leaves the caret between the markers, ready
    // for the words the marks are meant to cover.
    apply(`${head}${selected}${tail}`, head.length, head.length + selected.length)
  }

  // A reference is one per line and always trailing, so this adds the marker
  // ready-filled and puts the caret on the words to replace, rather than
  // asking for a label and a target up front.
  const referenced = hasCrossReference(value)
  const toggleReference = () => {
    if (referenced) return onChange(stripCrossReference(value))
    const label = 'See more'
    const marker = ` ${writeCrossReference(label, '/')}`
    const start = value.length + 1 + CROSS_REFERENCE_PREFIX.length + 1
    apply(`${value}${marker}`, start, start + label.length)
  }

  return (
    <div className="editor-toolbar" role="group" aria-label={`Formatting for ${context}`}>
      {CONTROLS.map(control => {
        const Icon = control.icon
        return (
          <IconButton key={control.mark} variant="bare" size="none" label={`${control.label} — ${context}`} title={control.hint} onClick={() => toggle(control.mark)}>
            <Icon aria-hidden="true" />
          </IconButton>
        )
      })}
      {/* SUB-BULLET FEATURE (unused) - start */}
      {subBullet && (
        <>
          <span className="toolbar-divider" aria-hidden="true" />
          <IconButton variant="bare" size="none" className={subBullet.active ? 'is-active' : undefined} aria-pressed={subBullet.active} label={`Sub-bullet — ${context}`} title="Sub-bullet (- text)" onClick={subBullet.onToggle}>
            <IndentIncrease aria-hidden="true" />
          </IconButton>
        </>
      )}
      {/* SUB-BULLET FEATURE (unused) - end */}
      {crossReference && (
        <>
          <span className="toolbar-divider" aria-hidden="true" />
          <IconButton variant="bare" size="none" className={referenced ? 'is-active' : undefined} aria-pressed={referenced} label={`Link to another page — ${context}`} title="Link to another page (@see[label](/path))" onClick={toggleReference}>
            <ArrowRight aria-hidden="true" />
          </IconButton>
        </>
      )}
    </div>
  )
}

function isDelimiter(character: string | undefined): boolean {
  return character === '*' || character === '_'
}

/**
 * The marks a run of delimiters stands for, or null when it spells something
 * this cannot safely rewrite — a lone underscore, or more asterisks than the
 * three that bold and italic together take.
 */
function readFence(fence: string): Marks | null {
  if (!fence) return { ...NO_MARKS }

  const marks: Marks = { ...NO_MARKS }
  for (const run of fence.match(/\*+|_+/g) ?? []) {
    if (run[0] === '_') {
      if (run.length !== 2) return null
      marks.underline = true
    } else {
      if (run.length > 3) return null
      if (run.length % 2 === 1) marks.italic = true
      if (run.length >= 2) marks.bold = true
    }
  }
  return marks
}

/** Underline sits outside the asterisks, so a fence closes as it opened. */
function writeFence(marks: Marks, side: 'opening' | 'closing'): string {
  const asterisks = '*'.repeat((marks.bold ? 2 : 0) + (marks.italic ? 1 : 0))
  const underscores = marks.underline ? '__' : ''
  return side === 'opening' ? `${underscores}${asterisks}` : `${asterisks}${underscores}`
}

function sameMarks(one: Marks, other: Marks): boolean {
  return one.bold === other.bold && one.italic === other.italic && one.underline === other.underline
}
