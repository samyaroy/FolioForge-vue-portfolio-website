import { useState } from 'react'
import { ImageOff } from 'lucide-react'

/** A row's picture; a missing one is ordinary, since not every entry has one uploaded yet. */
export function EntryThumbnail({ url }: { url: string }) {
  const [failed, setFailed] = useState(false)
  if (!url || failed) return <span className="entry-thumb entry-thumb-empty" aria-hidden="true"><ImageOff /></span>
  return <img className="entry-thumb" src={url} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
}
