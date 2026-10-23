<template>
    <!-- The counterpart of DocumentViewer for a role that points at a site
         rather than a document: same slot, same colours, but it leaves the page
         instead of opening a dialog. -->
    <a v-if="url" :href="url" target="_blank" rel="noopener noreferrer"
        :aria-label="label" :title="label"
        class="inline-flex no-underline text-[#646cff] hover:text-black transition-colors">
        <v-icon :size="size">mdi-link-variant</v-icon>
    </a>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    href: {
        type: String,
        default: ''
    },
    size: {
        type: [String, Number],
        default: 20
    },
    label: {
        type: String,
        default: 'Open link'
    }
})

// Only absolute http(s) URLs render. That drops the '#' placeholder the YAML
// uses for "nothing yet", blanks the admin writes for an empty field, and any
// scheme that would run in the page rather than open a site.
const url = computed(() => {
    const value = (props.href || '').trim()
    return /^https?:\/\//i.test(value) ? value : ''
})
</script>
