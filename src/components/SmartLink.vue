<template>
    <span v-if="!url">{{ text }}</span>
    <a v-else :href="url" target="_blank" rel="noopener noreferrer">
        {{ text }}
    </a>
</template>

<script setup>
import links from '@/metadata/hyperlinkMetadata.yml'

const props = defineProps({
    text: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: 'Institute'
    }
})

// Locate matching entity by Name
const entity = links[props.type]?.find(
    item => item.Name.trim().toLowerCase() === props.text.trim().toLowerCase()
)

const url = entity?.Website || entity?.Link || null
</script>