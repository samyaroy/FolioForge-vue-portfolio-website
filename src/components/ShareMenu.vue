<template>
  <button
    ref="triggerElement"
    type="button"
    :class="triggerClass"
    :aria-label="triggerLabel"
    aria-haspopup="menu"
    :aria-expanded="isOpen"
    @click.stop="toggleMenu"
  >
    <slot name="icon">
      <v-icon :size="iconSize">mdi-share-variant</v-icon>
    </slot>
  </button>

  <!-- Teleported because every card that hosts this button clips its own
       overflow; a popover positioned inside one would be cut off at the card
       edge. Fixed coordinates come from the trigger's rect instead. -->
  <Teleport to="body">
    <Transition name="share-menu-fade">
      <div
        v-if="isOpen"
        ref="menuElement"
        class="fixed z-[60] w-52 overflow-hidden rounded-[10px] bg-white shadow-[0_18px_42px_-10px_rgba(14,20,27,0.32)] ring-1 ring-slate-900/10"
        :style="menuStyle"
        role="menu"
        :aria-label="triggerLabel"
        @click.stop
      >
        <p class="truncate border-b border-slate-100 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {{ heading }}
        </p>

        <ul class="p-1">
          <li v-for="target in targets" :key="target.id">
            <button
              type="button"
              role="menuitem"
              class="flex w-full items-center gap-2.5 rounded-[6px] bg-transparent px-2 py-1.5 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none disabled:opacity-60"
              :disabled="isBusy"
              @click="activateTarget(target)"
            >
              <v-icon size="16" :class="iconClassFor(target)">{{ iconFor(target) }}</v-icon>
              <span>{{ labelFor(target) }}</span>
            </button>
          </li>
        </ul>

        <p v-if="statusMessage" class="border-t border-slate-100 px-2.5 py-1.5 text-[10px] leading-[14px] text-slate-500">
          {{ statusMessage }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
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
  type ShareContent,
  type ShareTarget,
} from '@shared/shareTargets'

defineOptions({
  name: 'ShareMenu',
  // Two root nodes (the trigger and the teleport), so a fallthrough class would
  // be ambiguous; call sites style the trigger through `triggerClass`.
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    content: ShareContent
    /** Classes for the trigger button, so it can match whatever hosts it. */
    triggerClass?: string
    triggerLabel?: string
    heading?: string
    iconSize?: number | string
  }>(),
  {
    triggerClass: '',
    triggerLabel: 'Share',
    heading: 'Share',
    iconSize: 20,
  },
)

const MENU_WIDTH = 208
const VIEWPORT_GAP = 8
const STATUS_TIMEOUT_MS = 6000

const isOpen = ref(false)
const isBusy = ref(false)
const hasCopied = ref(false)
const statusMessage = ref('')
const triggerElement = ref<HTMLElement | null>(null)
const menuElement = ref<HTMLElement | null>(null)
const menuPosition = ref({ top: 0, left: 0 })

let statusTimer: ReturnType<typeof setTimeout> | null = null
let copiedTimer: ReturnType<typeof setTimeout> | null = null

const targets = computed(() => resolveShareTargets(props.content))
const menuStyle = computed(() => ({
  top: `${menuPosition.value.top}px`,
  left: `${menuPosition.value.left}px`,
}))

watch(isOpen, async (open) => {
  if (typeof document === 'undefined') return

  if (!open) {
    releaseOpenShareMenu(closeMenu)
    document.removeEventListener('click', handleDocumentClick)
    document.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('resize', positionMenu)
    window.removeEventListener('scroll', positionMenu, true)
    return
  }

  // Closes whichever share menu was open before this one.
  claimOpenShareMenu(closeMenu)
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', positionMenu)
  // Capture phase: the card grid and the page both scroll, and only the capture
  // phase sees scrolls on containers that are not the window.
  window.addEventListener('scroll', positionMenu, true)

  await nextTick()
  positionMenu()
})

onBeforeUnmount(() => {
  isOpen.value = false
  clearTimers()
  // Directly, because the watcher above may not flush during unmount.
  releaseOpenShareMenu(closeMenu)

  if (typeof document === 'undefined') return

  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', positionMenu)
  window.removeEventListener('scroll', positionMenu, true)
})

function toggleMenu() {
  if (isOpen.value) {
    closeMenu()
    return
  }

  statusMessage.value = ''
  isOpen.value = true
}

function closeMenu() {
  isOpen.value = false
}

function positionMenu() {
  const trigger = triggerElement.value
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const menuHeight = menuElement.value?.offsetHeight ?? 320
  const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_GAP

  // Right-aligned to the trigger, then pulled back inside the viewport — the
  // button often sits at the right edge of a card near the right edge of the
  // grid.
  const left = Math.min(Math.max(VIEWPORT_GAP, rect.right - MENU_WIDTH), Math.max(VIEWPORT_GAP, maxLeft))
  const fitsBelow = rect.bottom + VIEWPORT_GAP + menuHeight <= window.innerHeight
  const fitsAbove = rect.top - VIEWPORT_GAP - menuHeight >= 0
  const top = fitsBelow || !fitsAbove ? rect.bottom + VIEWPORT_GAP : rect.top - VIEWPORT_GAP - menuHeight

  menuPosition.value = { top, left }
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Node | null
  if (target && (menuElement.value?.contains(target) || triggerElement.value?.contains(target))) return

  closeMenu()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return

  closeMenu()
  triggerElement.value?.focus()
}

function iconFor(target: ShareTarget) {
  return target.id === 'copy' && hasCopied.value ? 'mdi-check' : target.icon
}

function iconClassFor(target: ShareTarget) {
  return target.id === 'copy' && hasCopied.value ? 'text-emerald-500' : target.colorClass
}

function labelFor(target: ShareTarget) {
  if (target.id === 'copy' && hasCopied.value) return 'Link copied'
  if (target.id === 'instagram' && isBusy.value) return 'Preparing image…'

  return target.label
}

async function activateTarget(target: ShareTarget) {
  if (target.kind === 'link') {
    openShare(buildShareUrl(target.id, props.content))
    closeMenu()
    return
  }

  if (target.id === 'copy') {
    await copyLink()
    return
  }

  await handOffToInstagram()
}

async function copyLink() {
  const copied = await copyText(props.content.url)

  if (!copied) {
    setStatus('Could not reach the clipboard — copy the link from the address bar.')
    return
  }

  hasCopied.value = true
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    hasCopied.value = false
  }, 2500)
}

/**
 * Instagram has no share endpoint to open, so the hand-off is the image plus
 * the caption; see saveImage() in shared/shareTargets.ts. Both run at once so
 * the clipboard write does not spend the click's transient activation, which
 * the image fallback needs in order to open a tab.
 */
async function handOffToInstagram() {
  const { imageUrl, title, url } = props.content
  if (!imageUrl) return

  isBusy.value = true

  try {
    const [captionCopied, handoff] = await Promise.all([
      copyText(`${shareMessage(props.content)}\n${url}`),
      saveImage(imageUrl, imageFileName(imageUrl, title)),
    ])

    const imageNote = {
      downloaded: 'Image saved to your downloads',
      opened: 'Image opened in a new tab — save it from there',
      failed: 'Could not fetch the image — save it from the zoom view',
    }[handoff]

    setStatus(
      captionCopied
        ? `${imageNote}. Caption copied — paste it into Instagram.`
        : `${imageNote}. The caption could not be copied automatically.`,
    )
  } finally {
    isBusy.value = false
  }
}

function setStatus(message: string) {
  statusMessage.value = message
  if (statusTimer) clearTimeout(statusTimer)
  statusTimer = setTimeout(() => {
    statusMessage.value = ''
  }, STATUS_TIMEOUT_MS)
}

function clearTimers() {
  if (statusTimer) clearTimeout(statusTimer)
  if (copiedTimer) clearTimeout(copiedTimer)
  statusTimer = null
  copiedTimer = null
}
</script>

<style scoped>
.share-menu-fade-enter-active,
.share-menu-fade-leave-active {
  transition: opacity 140ms ease, transform 140ms ease;
}

.share-menu-fade-enter-from,
.share-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
