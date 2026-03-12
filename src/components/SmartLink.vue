<template>
    <span v-if="!resolvedUrl">{{ text }}</span>
    <a v-else :href="resolvedUrl" target="_blank" rel="noopener noreferrer" class="hover:underline">
        {{ text }}
    </a>
</template>

<script setup>
import { computed } from 'vue'
import links from '@/metadata/hyperlinkMetadata.yml'

const props = defineProps({
    text: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'Institute'
    },
    href: {
        type: String,
        default: null
    }
})

const resolvedUrl = computed(() => {
    const candidates = links[props.type]

    if (Array.isArray(candidates)) {
        const match = candidates.find(
            item =>
                item.Name?.trim().toLowerCase() ===
                props.text.trim().toLowerCase()
        )

        if (match?.Website) return match.Website
        if (match?.Link) return match.Link
    }

    // fallback
    return props.href || null
})
</script>