<template>
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-8">
        <button type="button"
            class="w-full flex items-center justify-between text-left focus:outline-none mb-6"
            :aria-expanded="isOpen"
            @click="isOpen = !isOpen">
            <h2 class="text-2xl font-bold text-[#0e141b]">Technical Projects</h2>
            <v-icon class="text-[#0e141b]">
                {{ isOpen ? 'mdi-unfold-less-horizontal' : 'mdi-unfold-more-horizontal' }}
            </v-icon>
        </button>

        <div v-if="projects && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="project in projects" :key="project.id"
                class="relative border rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow duration-200 text-sm"
                :class="isOpen ? '' : 'cursor-pointer'"
                :role="isOpen ? undefined : 'button'"
                :tabindex="isOpen ? undefined : 0"
                :aria-label="isOpen ? undefined : 'Expand technical projects section'"
                @click="expandSection"
                @keydown.enter="expandSection"
                @keydown.space.prevent="expandSection">
                <div
                    class="grid gap-2"
                    :class="isOpen ? 'grid-cols-[minmax(0,1fr)_auto] items-start mb-3' : 'grid-cols-[minmax(0,1fr)_minmax(8rem,14rem)] items-start'">
                    <h3 class="min-w-0 text-base sm:text-lg font-semibold text-[#0e141b]">{{ project.title }}</h3>
                    <div class="min-w-0 text-right">
                        <span v-if="project.time_period" class="block text-sm text-gray-500">
                            {{ project.time_period }}
                        </span>
                        <transition name="collapsed-affiliation">
                            <p
                                v-if="!isOpen && project.affiliation"
                                class="collapsed-affiliation-line mt-1 text-xs leading-4 text-gray-600">
                                {{ project.affiliation }}
                            </p>
                        </transition>
                    </div>
                </div>
                <v-expand-transition>
                <div v-show="isOpen">
                <transition name="affiliation-settle" appear>
                <div v-if="isOpen && (project.affiliation || project.logo)" class="flex items-start gap-2">
                    <div class="shrink-0 pt-0.5">
                        <v-icon size="16">mdi-attachment</v-icon>
                    </div>
                    <div v-if="project.affiliation" class="min-w-0 flex-1 text-sm leading-5">{{ project.affiliation }}</div>
                    <div v-if="project.logo" class="flex shrink-0 items-center gap-2">
                        <img v-for="logo in project.logo" :key="logo" :src="getLogoPath(logo)" :alt="logo" :title="logo"
                            class="max-h-7">
                    </div>
                </div>
                </transition>
                <div class="flex flex-wrap gap-1.5 mt-3 mb-3">
                    <span v-for="tag in Array.isArray(project.tech_stack)
                        ? project.tech_stack
                        : project.tech_stack.split(',').map(item => item.trim())" :key="tag"
                        class="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {{ tag }}
                    </span>
                </div>
                <p class="content-justify text-gray-600 mb-2 leading-5">{{ project.description }}</p>

                <!-- Bottom-right buttons -->
                <div class="absolute bottom-3 right-3 flex space-x-2">
                    <a v-if="project.cred_link && project.cred_link?.github" :href="project.cred_link.github"
                        target="_blank"
                        class="border border-[#1980e6] text-[#1980e6] w-9 h-9 rounded-full flex items-center justify-center shadow hover:bg-[#1980e6] hover:text-white transition">
                        <v-icon>mdi-github</v-icon>
                    </a>
                    <a v-if="project.cred_link && project.cred_link?.website" :href="project.cred_link.website"
                        target="_blank"
                        class="border border-[#01070d] text-[#000000] w-9 h-9 rounded-full flex items-center justify-center shadow hover:bg-[#000000] hover:text-white transition">
                        <v-icon>mdi-web</v-icon>
                    </a>
                </div>
                </div>
                </v-expand-transition>
            </div>
        </div>
        <div v-else class="text-center text-gray-500 italic">
            <span class="inline-flex items-end gap-2 border-b-2 border-slate-300 pb-0.5">
              <AnimatedIcon name="dino" :size="28" class="-mb-0.5 shrink-0" />
              <span>No Applied Projects Yet</span>
            </span>
        </div>
    </div>
</template>

<script setup>
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
import { ref } from 'vue'
import { isFeatureEnabled } from '@/config/featureFlags'
import { logoUrl } from '@/config/mediaAssets'

// Default expanded/collapsed state is controlled by a feature flag
const isOpen = ref(isFeatureEnabled('showProjectsPublications.expandProjectSectionsByDefault.technicalProjects'))

// Clicking anywhere on a card while the section is collapsed opens the section.
// Expanded cards stay inert so their inner links keep working.
function expandSection() {
    if (!isOpen.value) {
        isOpen.value = true
    }
}

defineProps({
    projects: {
        type: Array,
        default: () => []
    }
})
function getLogoPath(logo) {
    return logoUrl(logo);
    // src/metadata/logo/institute
}
</script>

<style scoped>
.collapsed-affiliation-line {
    display: -webkit-box;
    max-width: 14rem;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.collapsed-affiliation-enter-active,
.collapsed-affiliation-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.collapsed-affiliation-enter-from,
.collapsed-affiliation-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.affiliation-settle-enter-active {
    transition: opacity 0.7s ease, transform 0.7s ease;
}

.affiliation-settle-enter-from {
    opacity: 0;
    transform: translate(5rem, -1.25rem);
}

.affiliation-settle-enter-to {
    opacity: 1;
    transform: translate(0, 0);
}

@media (max-width: 640px) {
    .affiliation-settle-enter-from {
        transform: translate(1.5rem, -1rem);
    }
}
</style>
