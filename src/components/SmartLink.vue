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
    lookupText?: string | null
}>()

const resolvedUrl = computed<string | null>(() => {
    const groups = links as Record<string, LinkItem[]>
    const requestedType = normalizeValue(props.type ?? 'Institute')
    const groupKey = Object.keys(groups).find(
        (candidateKey) => normalizeValue(candidateKey) === requestedType
    )
    const candidates = groups[groupKey ?? 'Institute']
    const lookupValue = normalizeValue(props.lookupText || props.text)

    if (lookupValue && Array.isArray(candidates)) {
        const match = candidates.find(
            (item: LinkItem) =>
                normalizeValue(item.Name) === lookupValue
        )

        if (match?.Website) return match.Website
        if (match?.Link) return match.Link
    }

    return props.href || null
})

function normalizeValue(value?: string | null) {
    return typeof value === 'string'
        ? value.trim().toLowerCase()
        : ''
}
</script>
