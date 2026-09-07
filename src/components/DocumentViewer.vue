<template>
    <div>
        <!-- Trigger Icon -->
        <v-icon v-if="documents.length" :size="size" class="cursor-pointer"
            @click="open"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
            :color="isHovered ? '#000000' : '#646cff'">
            mdi-file-document-outline
        </v-icon>

        <!-- Dialog -->
        <v-dialog v-model="dialog" max-width="90vw">
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    {{ activeDocument?.label || 'Document' }}
                    <v-btn icon @click="dialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-tabs
                    v-if="documents.length > 1"
                    v-model="activeDocumentIndex"
                    density="compact"
                    color="#1980e6">
                    <v-tab v-for="(document, index) in documents" :key="`${document.url}-${index}`" :value="index">
                        {{ document.label }}
                    </v-tab>
                </v-tabs>

                <v-card-text style="height: 80vh; padding: 0;">
                    <iframe
                        v-if="dialog && activeDocument"
                        :src="viewerSrc(activeDocument.url)"
                        width="100%"
                        height="100%"
                        style="border:none" />
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
    src: {
        type: [String, Array, Object],
        required: true
    },
    size: {
        type: [String, Number],
        default: 20
    }
})

const dialog = ref(false)
const isHovered = ref(false)
const activeDocumentIndex = ref(0)

const documents = computed(() => normalizeDocuments(props.src))
const activeDocument = computed(() => documents.value[activeDocumentIndex.value] || documents.value[0] || null)

const open = () => {
    dialog.value = true
}

watch(documents, () => {
    activeDocumentIndex.value = 0
})

function normalizeDocuments(src) {
    if (Array.isArray(src)) {
        return src.map(normalizeDocument).filter(Boolean)
    }

    const singleDocument = normalizeDocument(src)
    return singleDocument ? [singleDocument] : []
}

function normalizeDocument(document) {
    if (typeof document === 'string') {
        return createDocument(document)
    }

    if (document && typeof document === 'object') {
        return createDocument(
            document.url || document.href || document.link || document.src,
            document.label || document.title || document.name
        )
    }

    return null
}

function createDocument(url, label = 'Certificate') {
    if (!url || url === '#') {
        return null
    }

    return {
        url,
        label: label || 'Certificate',
    }
}

function viewerSrc(url) {
    return url.includes('#') ? url : `${url}#view=FitV`
}
</script>
