import { nextTick } from 'vue'

/**
 * Brings the card a deep link asked for into view, and rings it briefly so it
 * is obvious which one the page scrolled to. The ring is `.card-linked` in
 * src/style.css.
 *
 * Two things happen after a page asks for this: a list may expand to reveal the
 * card, and the router's own scrollBehavior sends the page to the top. So the
 * position is asserted until it holds rather than set once and hoped for.
 *
 * A title edited on one side and not the other stops matching. The page is
 * still the right place to land, so a card that never turns up is not an error.
 */
export const LINKED_CARD_CLASS = 'card-linked'

export function focusLinkedCard(id: string): void {
  let attempts = 0
  const settle = () => {
    const card = document.getElementById(id)
    if (!card) {
      if (++attempts < 12) window.setTimeout(settle, 60)
      return
    }
    if (!card.classList.contains(LINKED_CARD_CLASS)) {
      card.classList.add(LINKED_CARD_CLASS)
      window.setTimeout(() => card.classList.remove(LINKED_CARD_CLASS), 2400)
    }
    const box = card.getBoundingClientRect()
    const centred = Math.abs(box.top + box.height / 2 - window.innerHeight / 2) < 140
    if (centred) return
    card.scrollIntoView({ behavior: attempts ? 'smooth' : 'auto', block: 'center' })
    if (++attempts < 12) window.setTimeout(settle, 80)
  }
  nextTick(settle)
}
