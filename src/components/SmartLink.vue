<template>
    <template v-for="segment in segments" :key="segment.key">
        <a
            v-if="segment.href"
            :href="segment.href"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:underline"
        >
            {{ segment.text }}
        </a>
        <span v-else>{{ segment.text }}</span>
    </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import links from '@/metadata/hyperlinkMetadata.yml'

interface LinkItem {
    Name?: string
    Aliases?: string[]
    Website?: string
    Link?: string
}

interface Segment {
    key: string
    text: string
    href: string | null
}

interface ResolveUrlOptions {
    text: string
    type?: string
    href?: string | null
    lookupText?: string | null
    preferHref?: boolean
}

const props = defineProps<{
    text: string
    type?: string
    href?: string | null
    lookupText?: string | null
    preferHref?: boolean
}>()

const INLINE_LINK_PATTERN = /`([^`]+)`/g

const segments = computed<Segment[]>(() => buildSegments(props.text))

function buildSegments(text: string) {
    if (!text) return []

    const parsedSegments: Array<Omit<Segment, 'key'>> = []
    let lastIndex = 0
    let hasInlineLinks = false

    for (const match of text.matchAll(INLINE_LINK_PATTERN)) {
        const matchIndex = match.index ?? 0
        hasInlineLinks = true

        if (matchIndex > lastIndex) {
            parsedSegments.push(createSegment(text.slice(lastIndex, matchIndex)))
        }

        const linkedText = match[1]
        parsedSegments.push(
            createSegment(
                linkedText,
                resolveUrl({
                    text: linkedText,
                    type: props.type,
                })
            )
        )

        lastIndex = matchIndex + match[0].length
    }

    if (!hasInlineLinks) {
        return [
            withKey(
                createSegment(
                    text,
                    resolveUrl({
                        text,
                        type: props.type,
                        href: props.href,
                        lookupText: props.lookupText,
                        preferHref: props.preferHref,
                    })
                ),
                0
            ),
        ]
    }

    if (lastIndex < text.length) {
        parsedSegments.push(createSegment(text.slice(lastIndex)))
    }

    return parsedSegments
        .filter((segment) => segment.text)
        .map((segment, index) => withKey(segment, index))
}

function resolveUrl(options: ResolveUrlOptions) {
    if (options.preferHref && options.href) return options.href

    const groups = links as Record<string, LinkItem[]>
    const requestedType = normalizeValue(options.type ?? 'Institute')
    const groupKey = Object.keys(groups).find(
        (candidateKey) => normalizeValue(candidateKey) === requestedType
    )
    const candidates = groups[groupKey ?? 'Institute']
    const lookupValue = normalizeValue(options.lookupText || options.text)

    if (lookupValue && Array.isArray(candidates)) {
        const match = candidates.find(
            (item: LinkItem) => getCandidateNames(item).some(
                (candidateName) => normalizeValue(candidateName) === lookupValue
            )
        )

        if (match?.Website) return match.Website
        if (match?.Link) return match.Link
    }

    return options.href || null
}

function createSegment(text: string, href: string | null = null) {
    return { text, href }
}

function getCandidateNames(item: LinkItem) {
    return [
        item.Name,
        ...(Array.isArray(item.Aliases) ? item.Aliases : []),
    ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
}

function withKey(segment: Omit<Segment, 'key'>, index: number): Segment {
    return {
        ...segment,
        key: `segment-${index}`,
    }
}

function normalizeValue(value?: string | null) {
    return typeof value === 'string'
        ? value.trim().toLowerCase()
        : ''
}
</script>
