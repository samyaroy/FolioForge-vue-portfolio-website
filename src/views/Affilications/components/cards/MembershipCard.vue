<template>
    <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex gap-4">
            <!-- Left: logo / badge -->
            <div class="w-[10%] flex items-start">
                <div
                    class="w-[60%] aspect-square rounded-lg overflow-hidden bg-gray-100 border border-slate-200 flex items-center justify-center">
                    <img v-if="logoSrc" :src="logoSrc" :alt="`${membership.organization || 'Membership'} logo`"
                        class="w-full h-full object-contain" />
                    <v-icon v-else size="22" class="text-slate-500">mdi-account-group</v-icon>
                </div>
            </div>

            <!-- Right: content (85%) -->
            <div class="flex-1 space-y-2">
                <div class="flex items-start justify-between gap-1">
                    <div>
                        <h3 class="text-lg font-semibold text-slate-900">
                            {{ membership.organization }} <span v-if="membership.chapter" class="text-sm text-gray-500">
                                - {{ membership.chapter }}</span>
                        </h3>
                    </div>
                    <span v-if="membership.location" class="text-gray-500 text-sm">
                        <v-icon size="14">mdi-map-marker</v-icon> {{ membership.location }}
                    </span>

                </div>
                <div class="flex items-start justify-between gap-1">
                    <div v-if="membership.role" class="text-gray-700">
                        {{ membership.role }}
                    </div>
                    <span v-if="membership.period" class="text-sm text-gray-500">
                        {{ membership.period }}
                    </span>


                </div>


                <!-- <div v-if="membership.link">
                    <a :href="membership.link" target="_blank" rel="noopener noreferrer"
                        class="text-[#1980e6] font-medium hover:underline">
                        View credential
                    </a>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    membership: {
        type: Object,
        required: true,
    },
})

// Eager-load all society/organization logos
const societyLogos = import.meta.glob('@/metadata/logo/society/*.{png,jpg,jpeg,webp}', {
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

const logoSrc = computed(() => {
    // Allow explicit logo path in config
    if (props.membership?.logo) return props.membership.logo

    const orgName = props.membership?.organization
    if (!orgName) return null

    const base = normalizeToFileBase(orgName)
    if (base) {
        // Try to find matching logo by checking if any key contains/ends with the normalized name
        const extensions = ['.jpg', '.jpeg', '.png', '.webp']
        for (const ext of extensions) {
            const filename = `${base}${ext}`
            // Check if any key in societyLogos matches the filename
            for (const key in societyLogos) {
                if (key.includes(filename) || key.endsWith(filename)) {
                    return societyLogos[key]
                }
            }
        }
    }

    return null
})
</script>
