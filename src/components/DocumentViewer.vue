<template>
    <div>
        <!-- Trigger Icon -->
        <v-icon v-if="src && src !== '#'" size="20" class="cursor-pointer"
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
                    Document
                    <v-btn icon @click="dialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text style="height: 80vh; padding: 0;">
                    <iframe v-if="dialog" :src="`${src}#view=FitV`" width="100%" height="100%" style="border:none" />
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
    src: {
        type: String,
        required: true
    }
})

const dialog = ref(false)
const isHovered = ref(false)

const open = () => {
    dialog.value = true
}
</script>