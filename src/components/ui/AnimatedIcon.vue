<template>
    <motion.svg
        :ref="setScope"
        :width="size"
        :height="size"
        :viewBox="icon.viewBox || '0 0 24 24'"
        v-bind="rootAttrs"
        class="cursor-pointer"
        :style="icon.svgStyle"
        @hover-start="startAnimation"
        @hover-end="stopAnimation"
    >
        <!-- Wrapper group so an icon can animate its whole glyph (the dino
             tilts) without needing a handle on the <svg> element itself. -->
        <motion.g class="icon-root" :style="icon.rootStyle">
            <component
                :is="motion[node.tag]"
                v-for="(node, i) in icon.nodes"
                :key="i"
                v-bind="node.attrs"
                :class="node.class"
                :style="node.style"
                :initial="node.initial"
            >
                <path v-for="(child, j) in node.children" :key="j" v-bind="child" />
            </component>
        </motion.g>
    </motion.svg>
</template>

<script setup>
// One component for every animated icon on the site, replacing the per-icon
// SFCs that were here before. Each entry below carries its own SVG nodes and
// its own start/stop animation, so adding an icon is a registry entry rather
// than a new file.
//
// The path data is NOT taken from @lucide/vue. Only `brain-circuit` matches
// lucide byte-for-byte; the `gmail` and `external-link` shapes originate from
// the itshover registry and are Tabler-derived, so pulling them from lucide
// would visibly change those icons. The literals below preserve the exact
// artwork that is on the site today.
import { computed } from 'vue'
import { motion, useAnimate } from 'motion-v'

// The 24x24 transparent spacer rect the Tabler-derived icons carry.
const SPACER = { tag: 'path', attrs: { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' } }
const CENTERED = { transformOrigin: 'center' }
const CENTERED_PCT = { transformOrigin: '50% 50%' }
const DRAWN = { pathLength: 1, opacity: 1 }

const ICONS = {
    gmail: {
        nodes: [
            SPACER,
            {
                tag: 'path',
                class: 'sides',
                style: CENTERED,
                attrs: { d: 'M16 20h3a1 1 0 0 0 1 -1v-14a1 1 0 0 0 -1 -1h-3v16z' },
            },
            {
                tag: 'path',
                class: 'sides',
                style: CENTERED,
                attrs: { d: 'M5 20h3v-16h-3a1 1 0 0 0 -1 1v14a1 1 0 0 0 1 1z' },
            },
            { tag: 'path', class: 'envelope-top', initial: DRAWN, attrs: { d: 'M16 4l-4 4l-4 -4' } },
            { tag: 'path', class: 'envelope-flap', initial: DRAWN, attrs: { d: 'M4 6.5l8 7.5l8 -7.5' } },
        ],
        async start(animate) {
            animate('.envelope-top', { pathLength: [0, 1], opacity: [0, 1] }, { duration: 0.4, ease: 'easeOut' })
            await animate('.envelope-flap', { pathLength: [0, 1], opacity: [0, 1] }, { duration: 0.5, ease: 'easeOut' })
            animate('.sides', { scaleY: [0.95, 1] }, { duration: 0.3, ease: 'easeOut' })
        },
        stop(animate) {
            animate(
                '.envelope-top, .envelope-flap, .sides',
                { pathLength: 1, opacity: 1, scaleY: 1 },
                { duration: 0.2 },
            )
        },
    },

    'external-link': {
        nodes: [
            SPACER,
            {
                tag: 'path',
                class: 'external-box',
                style: CENTERED_PCT,
                attrs: { d: 'M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6' },
            },
            {
                tag: 'g',
                class: 'external-arrow',
                style: CENTERED_PCT,
                children: [{ d: 'M11 13l9 -9' }, { d: 'M15 4h5v5' }],
            },
        ],
        start(animate) {
            // Arrow moves up and right (going external); box slightly shrinks.
            animate('.external-arrow', { x: 2, y: -2, scale: 1.1 }, { duration: 0.3, ease: 'easeOut' })
            animate('.external-box', { scale: 0.95 }, { duration: 0.3, ease: 'easeOut' })
        },
        stop(animate) {
            animate('.external-arrow, .external-box', { x: 0, y: 0, scale: 1 }, { duration: 0.25, ease: 'easeInOut' })
        },
    },

    'brain-circuit': {
        nodes: [
            { tag: 'path', class: 'brain-outline', attrs: { d: 'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z' } },
            { tag: 'path', class: 'circuit-line', attrs: { d: 'M9 13a4.5 4.5 0 0 0 3-4' } },
            { tag: 'path', class: 'brain-outline', attrs: { d: 'M6.003 5.125A3 3 0 0 0 6.401 6.5' } },
            { tag: 'path', class: 'brain-outline', attrs: { d: 'M3.477 10.896a4 4 0 0 1 .585-.396' } },
            { tag: 'path', class: 'brain-outline', attrs: { d: 'M6 18a4 4 0 0 1-1.967-.516' } },
            { tag: 'path', class: 'circuit-line', attrs: { d: 'M12 13h4' } },
            { tag: 'path', class: 'circuit-line', attrs: { d: 'M12 18h6a2 2 0 0 1 2 2v1' } },
            { tag: 'path', class: 'circuit-line', attrs: { d: 'M12 8h8' } },
            { tag: 'path', class: 'circuit-line', attrs: { d: 'M16 8V5a2 2 0 0 1 2-2' } },
            { tag: 'circle', class: 'terminal terminal-1', attrs: { cx: '16', cy: '13', r: '.5' } },
            { tag: 'circle', class: 'terminal terminal-2', attrs: { cx: '18', cy: '3', r: '.5' } },
            { tag: 'circle', class: 'terminal terminal-3', attrs: { cx: '20', cy: '21', r: '.5' } },
            { tag: 'circle', class: 'terminal terminal-4', attrs: { cx: '20', cy: '8', r: '.5' } },
        ],
        start(animate) {
            // Outline pulses, circuit lines draw in, terminals fire in sequence.
            animate('.brain-outline', { opacity: [1, 0.7, 1] }, { duration: 2, repeat: Infinity, ease: 'easeInOut' })
            animate('.circuit-line', { pathLength: [0, 1], opacity: [0, 1] }, { duration: 0.6, ease: 'easeOut' })
            const terminals = ['.terminal-1', '.terminal-2', '.terminal-3', '.terminal-4']
            terminals.forEach((selector, index) => {
                animate(selector, { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }, {
                    duration: 0.8,
                    delay: 0.2 + index * 0.15,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: 'easeInOut',
                })
            })
        },
        stop(animate) {
            animate('.brain-outline', { opacity: 1 }, { duration: 0.3 })
            animate('.circuit-line', { pathLength: 1, opacity: 1 }, { duration: 0.3 })
            animate('.terminal', { scale: 1, opacity: 1 }, { duration: 0.3 })
        },
    },

    // Empty-state mascot. Unlike the rest of the registry this one is solid
    // shapes on a 121x125 canvas rather than 24x24 strokes, and it tilts its
    // whole head back on hover. The interior cut-outs paint in the page
    // background: the original uses `var(--background)` directly, but under
    // Tailwind 3 that token holds bare HSL components, so it needs wrapping.
    dino: {
        // Cropped to the glyph's own bbox (26,35 63.1x68 on the original
        // 121x125 canvas). The stock viewBox leaves ~18% dead space under the
        // feet, which would float the dino above the ground line it stands on.
        viewBox: '25 34 65 70',
        filled: true,
        svgStyle: { overflow: 'visible' },
        nodes: [
            {
                tag: 'g',
                class: 'dino-body',
                children: [
                    { d: 'M0 0 C10.23 0 20.46 0 31 0 C32.25 2.5 32.11 4.2 32.1 7 C32.09 8 32.09 9 32.09 10 C32.08 11.5 32.08 11.5 32.06 13.1 C32.06 14.1 32.05 15.2 32.05 16.3 C32.04 18.8 32.02 21.4 32 24 C30.68 24 29.36 24 28 24 C28 25.65 28 27.3 28 29 C26.35 29 24.7 29 23 29 C23 33 23 37 23 41 C21.02 41 19.04 41 17 41 C17 43.3 17 45.6 17 48 C16.01 48 15.02 48 14 48 C14 49.3 14 50.6 14 52 C13.01 52 12.02 52 11 52 C11 55 11 58 11 61 C6.38 61 1.76 61 -3 61 C-3 63.3 -3 65.6 -3 68 C-7.62 68 -12.24 68 -17 68 C-17 64.7 -17 61.4 -17 58 C-17.99 58 -18.98 58 -20 58 C-20 57.01 -20 56.02 -20 55 C-20.99 55 -21.98 55 -23 55 C-23 54.01 -23 53.02 -23 52 C-23.99 52 -24.98 52 -26 52 C-26 51.01 -26 50.02 -26 49 C-26.99 49 -27.98 49 -29 49 C-29 48.34 -29 47.68 -29 47 C-29.66 47 -30.32 47 -31 47 C-31 38.1 -31 29.2 -31 20 C-27.04 20 -23.08 20 -19 20 C-19 22 -19 24 -19 26 C-16.03 26 -13.06 26 -10 26 C-10 25 10 24 10 23 C-8.68 23 -7.36 23 -6 23 C-6 22.3 -6 21.7 -6 21 C-5 21 -4 21 -3 21 C-3 15 -3 9.1 -3 3 C-2 3 -1 3 0 3 C0 2 0 1 0 0 Z', fill: 'currentColor', transform: 'translate(57,35)' },
                    { d: 'M5 5 C5 5.66 5 6.32 5 7 C4 7 3 7 2 7 C2 12.9 2 18.9 2 25 C1 25 0 25 -1 25 C-1 26 -1 27 -1 28 C-2.3 28 -3.6 28 -5 28 C-5 29 -5 30 -5 31 C-6.6 31 -8.3 31 -10 31 C-10 32 -10 33 -10 34 C-10.7 34 -11.3 34 -12 34 C-12 34.7 -12 35.3 -12 36 C-14 36 -16 36 -18 36 C-18 35 -18 34 -18 33 C-19 33 -20 33 -21 33 C-21 32.3 -21 31.7 -21 31 C-22 31 -23 31 -24 31 C-24 29 -24 27 -24 25 C-25 25 -26 25 -27 25 C-27 30.6 -27 36.2 -27 42 C-26 42 -25 42 -24 42 C-24 42.7 -24 43.3 -24 44 C-23 44 -22 44 -21 44 C-21 45 -21 46 -21 47 C-20 47 -19 47 -18 47 C-18 48 -18 49 -18 50 C-17 50 -16 50 -15 50 C-15 51 -15 52 -15 53 C-14.3 53 -13.7 53 -13 53 C-13 56.6 -13 60.3 -13 64 C-11 64 -9 64 -7 64 C-7 63 -7 62 -7 61 C-7.7 61 -8.3 61 -9 61 C-9 60.3 -9 59.7 -9 59 C-8.3 59 -7.7 59 -7 59 C-7 58 -7 57 -7 56 C-6 56 -5 56 -4 56 C-4 55 -4 54 -4 53 C-3 53 -2 53 -1 53 C-1 54 -1 55 -1 56 C1.7 57.4 4 57.1 7 57 C7 56 -7 55 -7 54 C6 54 5 54 4 54 C4 52.7 4 51.4 4 50 C5 50 6 50 7 50 C7 49 7 48 7 47 C7.7 47 8.3 47 9 47 C9 43.1 9 44.4 9 43 C10 43 11 43 12 43 C12 40 12 37.1 12 34 C13 34 14 34 15 34 C15 34.7 15 35.3 15 36 C16 36 17 36 18 36 C18 34.4 18 32.7 18 31 C16 31 14 31 12 31 C12 29 12 27 12 25 C16 25 19.9 25 24 25 C24 24 24 23 24 22 C21 22 18.1 22 15 22 C15 21 15 20 15 19 C19.6 19 24.2 19 29 19 C29 15 29 11.1 29 7 C28 7 27 7 26 7 C26 6.3 26 5.7 26 5 C19.1 5 12.1 5 5 5 Z', fill: 'hsl(var(--background))', transform: 'translate(57,35)' },
                    { d: 'M0 0 C1.65 0 3.3 0 5 0 C6.25 2.5 6.11 4.2 6.1 7 C6.09 8 6.09 9 6.09 10 C6.08 11 6.07 12.1 6.06 13.1 C6.06 14.2 6.05 15.2 6.05 16.3 C6.04 18.9 6.02 21.4 6 24 C5.24 23.8 4.47 23.7 3.69 23.5 C0.96 22.9 0.96 22.9 -2 23 C-3.56 22.8 -5.13 22.7 -6.69 22.5 C-7.9 22.4 -7.9 22.4 -9.14 22.2 C-9.75 22.1 -10.37 22.1 -11 22 C-11 21 -11 20 -11 19 C-6.38 19 -1.76 19 3 19 C3 15 3 11.1 3 7 C2 7 1 7 0 7 C0 6.3 0 5.7 0 5 C-6.93 5 -13.9 5 -21 5 C-21.3 5.7 -21.7 6.3 -22 7 C-22 6 -22 5 -22 4 C-15.4 4 -8.8 4 -2 4 C-1.34 2.7 -0.68 1.4 0 0 Z', fill: 'currentColor', transform: 'translate(83,35)' },
                    { d: 'M0 0 C0.33 3.6 0.66 7.3 1 11 C-0.65 10.7 -2.3 10.3 -4 10 C-4 8 -4 6 -4 4 C-4.99 3.7 -5.98 3.3 -7 3 C-4.5 0 -4.26 0 0 0 Z', fill: 'currentColor', transform: 'translate(38,55)' },
                    { d: 'M0 0 C1.98 0 3.96 0 6 0 C6 1.98 6 3.96 6 6 C4.02 6 2.04 6 0 6 C0 4.02 0 2.04 0 0 Z', fill: 'currentColor', transform: 'translate(64,44)' },
                ],
            },
            {
                tag: 'g',
                class: 'dino-leg-left',
                children: [
                    { d: 'M0 0 C0.99 0 1.98 0 3 0 C3 0.66 3 1.32 3 2 C4 2.3 5 2.7 6 3 C5.01 4.5 5.01 4.5 4 6 C3.34 6 2.68 6 2 6 C1.67 7.3 1.34 8.6 1 10 C1 9 1 8 1 7 C0 7 -1 7 -2 7 C-1.34 4.7 -0.68 2.4 0 0 Z', fill: 'currentColor', transform: 'translate(30,77)' },
                ],
            },
            {
                tag: 'g',
                class: 'dino-leg-right',
                children: [
                    { d: 'M0 0 C0.33 0 0.66 0 1 0 C1 3.3 1 6.6 1 10 C1.66 10 2.32 10 3 10 C3.33 8.7 3.66 7.4 4 6 C4 6.7 4 7.3 4 8 C4.66 8 5.32 8 6 8 C6 8.99 6 9.98 6 11 C4.02 11 2.04 11 0 11 C0 7.37 0 3.74 0 0 Z', fill: 'currentColor', transform: 'translate(44,88)' },
                ],
            },
        ],
        start(animate) {
            // Tilt the head to the sky. originY pins the pivot to the feet:
            // motion manages transform-origin itself, so a CSS value on the
            // group would just be overwritten with its 50% 50% default.
            animate('.icon-root', { rotate: -10, originX: 0.5, originY: 1 }, { duration: 0.3, ease: 'easeOut' })
        },
        stop(animate) {
            animate('.icon-root', { rotate: 0, originX: 0.5, originY: 1 }, { duration: 0.2, ease: 'easeIn' })
        },
    },

    'chart-bar': {
        // Outline bars only — the root svg is fill="none" and no node sets a
        // fill, so these stay hollow like the mdi glyph they replace.
        nodes: [
            SPACER,
            {
                tag: 'path',
                class: 'bar-1',
                style: { transformOrigin: '6px 20px' },
                attrs: { d: 'M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z' },
            },
            {
                tag: 'path',
                class: 'bar-2',
                style: { transformOrigin: '12px 20px' },
                attrs: { d: 'M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z' },
            },
            {
                tag: 'path',
                class: 'bar-3',
                style: { transformOrigin: '18px 20px' },
                attrs: { d: 'M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z' },
            },
            {
                tag: 'path',
                class: 'base-line',
                style: { transformOrigin: '11px 20px' },
                attrs: { d: 'M4 20h14' },
            },
        ],
        start(animate) {
            // Bars grow up from the baseline in sequence, baseline flexes.
            animate('.bar-1', { scaleY: [0, 1] }, { duration: 0.3, ease: 'easeOut' })
            animate('.bar-2', { scaleY: [0, 1] }, { duration: 0.3, ease: 'easeOut', delay: 0.1 })
            animate('.bar-3', { scaleY: [0, 1] }, { duration: 0.3, ease: 'easeOut', delay: 0.2 })
            animate('.base-line', { scaleX: [1, 1.05, 1] }, { duration: 0.4, ease: 'easeInOut' })
        },
        stop(animate) {
            animate('.bar-1, .bar-2, .bar-3', { scaleY: 1 }, { duration: 0.2, ease: 'easeInOut' })
            animate('.base-line', { scaleX: 1 }, { duration: 0.2, ease: 'easeInOut' })
        },
    },

    'map-pin': {
        // Static pin body, with the inner dot pulsing like a beacon. The
        // original drives this with a while-loop guarded by a ref; an infinite
        // `repeat` is the same animation without the per-instance state.
        svgStyle: { overflow: 'visible' },
        nodes: [
            { tag: 'path', attrs: { d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0' } },
            { tag: 'circle', class: 'pin-dot', attrs: { cx: '12', cy: '10', r: '3' } },
        ],
        start(animate) {
            animate('.pin-dot', { opacity: [1, 0.4, 1] }, { duration: 0.6, repeat: Infinity, ease: 'easeInOut' })
        },
        stop(animate) {
            animate('.pin-dot', { opacity: 1 }, { duration: 0.3 })
        },
    },

    'plug-connected': {
        nodes: [
            SPACER,
            { tag: 'path', class: 'plug-lower-part', attrs: { d: 'M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5z' } },
            { tag: 'path', class: 'plug-upper-part', attrs: { d: 'M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5z' } },
            { tag: 'path', class: 'plug-lower-part', attrs: { d: 'M3 21l2.5 -2.5' } },
            { tag: 'path', class: 'plug-upper-part', attrs: { d: 'M18.5 5.5l2.5 -2.5' } },
            { tag: 'path', class: 'plug-lower-part plug-lower-leg', attrs: { d: 'M10 11l-2 2' } },
            { tag: 'path', class: 'plug-lower-part plug-lower-leg', attrs: { d: 'M13 14l-2 2' } },
        ],
        start(animate) {
            animate('.plug-upper-part', { y: 2, x: -2 }, { duration: 0.35, ease: 'easeOut' })
            animate('.plug-lower-leg', { opacity: 0 }, { duration: 0.35, ease: 'easeOut' })
            animate('.plug-lower-part', { y: -2, x: 2 }, { duration: 0.35, ease: 'easeOut' })
        },
        stop(animate) {
            animate(
                '.plug-upper-part, .plug-lower-leg, .plug-lower-part',
                { y: 0, x: 0, opacity: 1 },
                { duration: 0.3, ease: 'easeInOut' },
            )
        },
    },
}

// No `validator` here: defineProps is hoisted by the SFC compiler and cannot
// reference ICONS, so the name is checked in the computed below instead.
const props = defineProps({
    name: { type: String, required: true },
    size: { type: [Number, String], default: 24 },
    color: { type: String, default: 'currentColor' },
    strokeWidth: { type: Number, default: 2 },
})

const icon = computed(() => {
    const entry = ICONS[props.name]
    if (!entry) {
        throw new Error(
            `<AnimatedIcon name="${props.name}"> is not a known icon. Available: ${Object.keys(ICONS).join(', ')}`,
        )
    }
    return entry
})

// Most icons are strokes over a transparent fill; a `filled` entry (the dino)
// is solid shapes instead and must not inherit the stroke attributes.
const rootAttrs = computed(() =>
    icon.value.filled
        ? { fill: props.color }
        : {
            fill: 'none',
            stroke: props.color,
            'stroke-width': props.strokeWidth,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
        },
)

const [scope, animate] = useAnimate()

// Bound as a function ref: <script setup> auto-unwraps a ref-like binding used
// directly in :ref, which would hand Vue scope.value (null) instead of scope.
const setScope = (el) => {
    scope.value = el
}

function startAnimation() {
    icon.value.start(animate)
}

function stopAnimation() {
    icon.value.stop(animate)
}

// Lets a parent drive the animation from its own hover target (a card, a link,
// a button) rather than from the icon's own narrow stroke hit-area.
defineExpose({ startAnimation, stopAnimation })
</script>
