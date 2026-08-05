import { useEffect, useState } from 'react'
import {
  getTileImages,
  type HobbyTile as HobbyTileData,
} from '../../../content/hobbies/data'

/** How long the icon rests, once the turn onto it has finished. */
const ICON_HOLD_MS = 1800
/** How long a picture rests, once the turn onto it has finished. */
const IMAGE_HOLD_MS = 700
/** Length of the turn itself; drives the CSS transition too. */
const FLIP_MS = 700
/** Per-tile offset so the mosaic ripples instead of flipping in lockstep. */
const STAGGER_MS = 600

const TILE_CLASS =
  'aspect-square w-[calc((100%-1.5rem)/3)] rounded-2xl transition-transform duration-300 ease-[ease] hover:-translate-y-1 perspective-[900px] sm:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)]'

const FACE_CLASS =
  'absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl backface-hidden'

type HobbyTileProps = {
  tile: HobbyTileData
  /** Position in the mosaic; drives the stagger only. */
  order: number
}

/**
 * One mosaic tile. A tile that has both an icon and at least one picture
 * turns over on a timer — icon, first picture, icon, second picture, and so
 * on round the list. Anything else renders as a still face: the picture if
 * one is set, otherwise the icon.
 */
export function HobbyTile({ tile, order }: HobbyTileProps) {
  const images = getTileImages(tile)
  const [reducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )
  // Turning over needs two faces to show, and nobody who asked for stillness.
  const flips = Boolean(tile.icon) && images.length > 0 && !reducedMotion
  const [step, setStep] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    if (!flips) return

    // Each hold is timed from the end of the turn rather than the start, so a
    // face rests for its full time instead of spending it mid-rotation.
    let current = 0
    let timer = 0

    function schedule() {
      // Even steps land on the icon, odd steps on a picture.
      const hold = current % 2 === 0 ? ICON_HOLD_MS : IMAGE_HOLD_MS
      timer = window.setTimeout(advance, FLIP_MS + hold)
    }

    function advance() {
      current += 1
      setStep(current)
      schedule()
    }

    timer = window.setTimeout(advance, ICON_HOLD_MS + order * STAGGER_MS)

    return () => window.clearTimeout(timer)
  }, [flips, order])

  // Even steps face front. Rotation accumulates rather than ping-ponging so
  // the tile always spins the same way.
  const showsFront = step % 2 === 0
  const stillImage = flips ? undefined : images[0]

  return (
    <li className={TILE_CLASS} title={tile.label}>
      <div
        className="relative size-full transition-transform ease-in-out transform-3d"
        style={{
          transform: `rotateY(${step * 180}deg)`,
          transitionDuration: `${FLIP_MS}ms`,
        }}
        onTransitionEnd={() => {
          // The back is hidden and has a full hold before it swings round
          // again, so this is the one safe moment to swap its picture.
          if (showsFront) setImageIndex((current) => (current + 1) % images.length)
        }}
      >
        <div
          className={`${FACE_CLASS} ${tile.tint ? 'bg-[#dbeafe]' : 'bg-page'}`}
        >
          {stillImage ? (
            <img
              className="size-full object-cover"
              src={stillImage}
              alt=""
              loading="lazy"
            />
          ) : (
            <span
              className={`mdi ${tile.icon} text-4xl leading-none text-ink md:text-5xl`}
              aria-hidden="true"
            />
          )}
        </div>

        {flips && (
          <div className={`${FACE_CLASS} rotate-y-180`}>
            <img
              className="size-full object-cover"
              src={images[imageIndex]}
              alt=""
              loading="lazy"
            />
          </div>
        )}
      </div>
      <span className="sr-only">{tile.label}</span>
    </li>
  )
}
