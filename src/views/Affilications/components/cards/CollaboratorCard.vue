<template>
    <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex gap-4">
            <!-- Left: avatar/logo -->
            <div class="w-[15%] flex items-start">
                <div
                    class="w-full h-full aspect-square rounded-lg overflow-hidden bg-gray-100 border border-slate-200 flex items-center justify-center">
                    <img :src="avatarSrc" :alt="`${collaborator?.name || 'Collaborator'} avatar`"
                        class="w-full h-full object-contain" />
                </div>
            </div>

            <!-- Right: content (80%) -->
            <div class="flex-1 space-y-2">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h3 class="text-lg font-semibold text-slate-900">
                            <SmartLink :text="collaborator.name || 'Collaborator'" :type="'Person'" /><v-icon size="14" class="text-[#4e7397] ml-2">mdi-open-in-new</v-icon>
                        </h3>

                        <p v-if="collaborator.affiliation" class="text-sm text-gray-600">
                            <v-icon size="16" class="text-[#4e7397]">mdi-domain</v-icon>
                            {{ collaborator.affiliation }}
                        </p>

                        <p v-if="collaborator.location" class="text-sm text-gray-500">
                            <v-icon size="16" class="text-[#4e7397]">mdi-map-marker</v-icon>
                            {{ collaborator.location }}
                        </p>
                    </div>

                    <span v-if="collaborator.period" class="text-sm text-gray-500">
                        {{ collaborator.period }}
                    </span>
                </div>
                <div v-if="collaborator.projects && collaborator.projects.length" class="flex items-center gap-2">
                    <div class="items-left text-md">Projects:</div>
                    <div class="flex flex-col text-md">
                    <p v-for="project in collaborator.projects" :key="project" class="text-gray-700 pl-7">
                        {{ project }}
                    </p>
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import SmartLink from '@/components/SmartLink.vue'
import profileIcon from '@/metadata/people/profile-icon.png'

// Eager-load all collaborator photos in src/metadata/people
// Vite will turn these into resolved URLs at build time.
const peoplePhotos = import.meta.glob('@/metadata/people/*.{png,jpg,jpeg,webp}', {
    eager: true,
    import: 'default',
})

function normalizeToFileBase(name) {
    return String(name || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')
}

const props = defineProps({
    collaborator: {
        type: Object,
        required: true,
    },
})

const avatarSrc = computed(() => {
    // Allow explicit per-collaborator image path in config
    if (props.collaborator?.logo) return props.collaborator.logo
    if (props.collaborator?.photo) return props.collaborator.photo

    const base = normalizeToFileBase(props.collaborator?.name)
    if (base) {
        // Try to find matching photo by checking if any key ends with the normalized name
        const extensions = ['.jpg', '.jpeg', '.png', '.webp']
        for (const ext of extensions) {
            const filename = `${base}${ext}`
            // Check if any key in peoplePhotos matches the filename
            for (const key in peoplePhotos) {
                if (key.includes(filename) || key.endsWith(filename)) {
                    return peoplePhotos[key]
                }
            }
        }
    }

    // Fallback to profile-icon.png
    return profileIcon
})
</script>
