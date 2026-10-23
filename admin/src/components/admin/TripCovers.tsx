import { useEffect, useState } from 'react'
import { ImageOff, Loader2, RefreshCw, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button, FileField, IconButton } from '@/components/form'
import { isWebpCover, prepareTripCover } from '@/lib/tripCovers'
import { fetchCollection } from '@/services/content'
import { announcePendingChange } from '@/services/pending'
import { discardDraft, publishTripCover, uploadImage } from '@/services/uploads'

type Trip = { id: string; title: string; coverImage?: string }

const COLLECTION = 'travel/trips'

function tripsOf(entries: unknown[]): Trip[] {
  return entries.flatMap(entry => {
    if (!entry || typeof entry !== 'object') return []
    const { id, title, coverImage } = entry as Record<string, unknown>
    if (typeof id !== 'string' || !id) return []
    return [{ id, title: typeof title === 'string' && title ? title : id, ...(typeof coverImage === 'string' && coverImage ? { coverImage } : {}) }]
  })
}

/**
 * The covers on the travel page, one card per trip in trips.yml. A photo picked
 * here is re-encoded to WebP in the browser, staged, then published into
 * blog-travel/ by the Worker, which also points the trip at it in the batch
 * waiting to be published. Nothing reaches the site until that batch does.
 */
export function TripCovers({ connected }: { /** GitHub, R2 and upload storage are all there. */ connected: boolean }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // The trip whose cover is being replaced, and what is happening to it.
  const [busy, setBusy] = useState<{ id: string; step: string } | null>(null)

  // State changes only once the answer is in, so the first load can run
  // straight from the effect.
  const load = (signal: AbortSignal) => fetchCollection(COLLECTION, signal)
    .then(state => { setTrips(tripsOf(state.entries)); setError(null) })
    .catch((loadError: unknown) => {
      if (loadError instanceof Error && loadError.name === 'AbortError') return
      setError(loadError instanceof Error ? loadError.message : 'Could not read trips.yml.')
    })
    .finally(() => setLoading(false))

  const refresh = () => {
    setLoading(true)
    void load(new AbortController().signal)
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [])

  const replaceCover = async (trip: Trip, file: File | undefined) => {
    if (!file || busy) return
    let draft: string | undefined
    try {
      setBusy({ id: trip.id, step: 'Converting to WebP...' })
      const prepared = await prepareTripCover(file)
      setBusy({ id: trip.id, step: 'Uploading...' })
      draft = (await uploadImage(prepared, new AbortController().signal)).name
      setBusy({ id: trip.id, step: 'Publishing...' })
      // Read again rather than reuse the list's revision: another edit may
      // have joined the pending batch since this page loaded.
      const { baseSha } = await fetchCollection(COLLECTION, new AbortController().signal)
      const published = await publishTripCover(draft, trip.id, baseSha)
      announcePendingChange()
      toast.success(`${trip.title}: cover published as ${published.key}. trips.yml is waiting in pending changes.`)
      refresh()
    } catch (coverError) {
      toast.error(coverError instanceof Error ? coverError.message : 'Could not replace that cover.')
    } finally {
      // Published or not, the staged copy has done its job.
      if (draft) void discardDraft(draft).catch(() => undefined)
      setBusy(null)
    }
  }

  const converted = trips.filter(trip => isWebpCover(trip.coverImage)).length

  return (
    <section className="logo-library">
      <div className="media-folder">
        <div className="section-heading">
          <div><h2>Trip covers</h2><span>{converted} of {trips.length} in WebP</span></div>
          <div className="logo-library-actions">
            <IconButton variant="outline" label="Refresh trip covers" disabled={loading} onClick={() => refresh()}><RefreshCw aria-hidden="true" /></IconButton>
          </div>
        </div>
        {error && <p className="logo-catalog-notice">{error}</p>}
        {!connected && <p className="logo-catalog-notice">GitHub, R2 and upload storage all have to be connected to replace a cover.</p>}
        <div className="media-grid">
          {trips.map(trip => (
            <article className="media-card" key={trip.id}>
              {trip.coverImage
                ? <img src={trip.coverImage} alt="" loading="lazy" />
                : <span className="trip-cover-empty"><ImageOff aria-hidden="true" /></span>}
              <div>
                <strong title={trip.title}>{trip.title}</strong>
                <span>{trip.id}{trip.coverImage ? (isWebpCover(trip.coverImage) ? ' - WebP' : ' - not WebP yet') : ' - no cover'}</span>
                <span className="logo-card-actions">
                  {busy?.id === trip.id
                    ? <span><Loader2 className="media-spin" aria-hidden="true" /> {busy.step}</span>
                    : (
                      <FileField
                        fieldClassName="logo-upload"
                        aria-label={`Replace the cover of ${trip.title}`}
                        accept="image/*"
                        disabled={!connected || Boolean(busy)}
                        title="Pick a photo; it is re-encoded to WebP (up to 3840px) before upload"
                        onSelect={files => void replaceCover(trip, files?.[0])}
                      >
                        <Upload aria-hidden="true" /><span>{trip.coverImage ? 'Replace cover' : 'Add cover'}</span>
                      </FileField>
                    )}
                </span>
              </div>
            </article>
          ))}
        </div>
        {!loading && !error && !trips.length && <div className="simple-empty">No trips in trips.yml.</div>}
        {loading && !trips.length && <Button variant="bare" disabled><Loader2 className="media-spin" aria-hidden="true" /> Loading trips...</Button>}
      </div>
    </section>
  )
}
