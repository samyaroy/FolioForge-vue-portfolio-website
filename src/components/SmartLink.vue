<template>
    <span v-if="!resolvedUrl">{{ text }}</span>
    <a v-else :href="resolvedUrl" target="_blank" rel="noopener noreferrer" class="hover:underline">
        {{ text }}
    </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import links from '@/metadata/hyperlinkMetadata.yml'

interface LinkItem {
    Name?: string
    Website?: string
    Link?: string
}

const props = defineProps<{
    text: string
    type?: string
    href?: string | null
}>()

const resolvedUrl = computed<string | null>(() => {
    const candidates = (links as Record<string, LinkItem[]>)[props.type ?? 'Institute']

    if (Array.isArray(candidates)) {
        const match = candidates.find(
            (item: LinkItem) =>
                item.Name?.trim().toLowerCase() ===
                props.text.trim().toLowerCase()
        )

        if (match?.Website) return match.Website
        if (match?.Link) return match.Link
    }

    return props.href || null
})
</script>