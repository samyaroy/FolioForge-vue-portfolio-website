import { ArrowRight } from 'lucide-react'
import { InlineMarkup } from '@/components/InlineMarkup'
import { hasEmphasis } from '../../../../src/utils/inlineMarkup'
import { isSubBullet, stripSubBullet } from '../../../../src/utils/bulletLines'
import { splitCrossReference } from '../../../../src/utils/crossReference'

type MarkupPreviewProps = {
  value: string
  /**
   * SUB-BULLET FEATURE (unused): the number this line would be given. Left out
   * where the field is a single value rather than one of a numbered run.
   */
  ordinal?: number
}

/**
 * What the site will draw, for a field whose text carries markup.
 *
 * Only shown once there is something to check, so a plain field keeps its room.
 * Everything it knows comes from the site's own modules, so the editor cannot
 * show one thing and the page render another.
 */
export function MarkupPreview({ value, ordinal }: MarkupPreviewProps) {
  const nested = ordinal !== undefined && isSubBullet(value)
  const { text, reference } = splitCrossReference(nested ? stripSubBullet(value) : value)

  if (!hasEmphasis(value) && !nested && !reference) return null

  return (
    <p className="description-line-preview" data-nested={nested || undefined}>
      <span>Preview</span>
      {nested && <span className="description-line-ordinal">{ordinal}.</span>}
      <InlineMarkup text={text} />
      {reference && (
        <span className="description-line-reference">{reference.label}<ArrowRight aria-hidden="true" /></span>
      )}
    </p>
  )
}
