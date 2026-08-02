<template>
    <motion.svg
        :ref="setScope"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="cursor-pointer"
        :style="icon.svgStyle"
        @hover-start="startAnimation"
        @hover-end="stopAnimation"
    >
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
