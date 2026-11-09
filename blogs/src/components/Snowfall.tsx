import { useState } from 'react'
import { Snowfall as FallingSnow } from 'falling-snow/react'

// The page is near-white and has no dark theme, so the package's default white
// flakes would not show. An icy blue reads on the page and over photos alike.
const FLAKE_COLORS = ['#9dc3ec', '#b9d5f3']

// Above page content, but under the sticky header and modals (z-50), the reading
// bar (z-55) and the share menu (z-60); the package's default of 9999 would cover
// them all. The home and gallery filters can't be kept clear: the transforms on
// their full-bleed wrappers trap the filters' z-index, so any value that shows
// snow over the page also shows it over them. That is only visual, since the
// canvas ignores the pointer.
const SNOW_Z_INDEX = 20

// The package takes a fixed number of flakes rather than a density, so one
// number would look sparse on a large monitor and crowded on a phone.
function flakeCountForViewport() {
  const count = Math.round((window.innerWidth * window.innerHeight) / 14000)
  return Math.min(140, Math.max(30, count))
}

/**
 * Decorative falling snow over the whole page, drawn on one fixed canvas that
 * the package appends to <body>. It ignores pointer events, is hidden from
 * assistive tech, pauses in hidden tabs, and becomes a still frame for readers
 * who prefer reduced motion. Print hides it in index.css.
 */
export function Snowfall() {
  const [count] = useState(flakeCountForViewport)

  return (
    <FallingSnow
      fullScreen
      count={count}
      colors={FLAKE_COLORS}
      size={[3, 13]}
      zIndex={SNOW_Z_INDEX}
    />
  )
}
