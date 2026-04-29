<template>
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-8">
        <button type="button"
            class="w-full flex items-center justify-between text-left focus:outline-none mb-6"
            :aria-expanded="isOpen"
            @click="isOpen = !isOpen">
            <div class="flex flex-wrap items-baseline gap-2">
                <h2 class="text-2xl font-bold text-[#0e141b]">Other Projects</h2>
                <span class="text-sm font-medium text-gray-500">(Live / Operational)</span>
            </div>
            <v-icon class="text-[#0e141b]">
                {{ isOpen ? 'mdi-unfold-less-horizontal' : 'mdi-unfold-more-horizontal' }}
            </v-icon>
        </button>

        <div v-if="projects && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="(project, index) in projects" :key="project.id || project.title || index"
                class="relative border rounded-lg p-3.5 hover:shadow-md transition-shadow duration-200 text-sm"
                :class="isOpen ? '' : 'cursor-pointer'"
                :role="isOpen ? undefined : 'button'"
                :tabindex="isOpen ? undefined : 0"
                :aria-label="isOpen ? undefined : 'Expand other projects section'"
                @click="expandSection"
                @keydown.enter="expandSection"
                @keydown.space.prevent="expandSection">
                <div class="flex items-start justify-between gap-3" :class="isOpen ? 'mb-2' : ''">
                    <h3 class="min-w-0 text-base font-semibold text-[#0e141b]">{{ project.title }}</h3>
                    <div v-if="!isOpen && hasActionLinks(project)" class="shrink-0 flex items-center gap-1.5">
                        <a v-if="project.cred_link?.github" :href="project.cred_link.github" target="_blank"
                            rel="noopener noreferrer"
                            class="border border-[#1980e6] text-[#1980e6] w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-[#1980e6] hover:text-white transition"
                            aria-label="Open GitHub repository"
                            @click.stop
                            @keydown.enter.stop
                            @keydown.space.stop>
                            <v-icon size="16">mdi-github</v-icon>
                        </a>
                        <a v-if="project.cred_link?.website" :href="project.cred_link.website" target="_blank"
                            rel="noopener noreferrer"
                            class="border border-[#01070d] text-[#000000] w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-[#000000] hover:text-white transition"
                            aria-label="Open project website"
                            @click.stop
                            @keydown.enter.stop
                            @keydown.space.stop>
                            <v-icon size="16">mdi-web</v-icon>
                        </a>
                    </div>
                </div>

                <v-expand-transition>
                    <div v-show="isOpen">
                        <div v-if="getTechStack(project.tech_stack).length" class="flex flex-wrap gap-1 mb-2">
                            <span v-for="tag in getTechStack(project.tech_stack)" :key="tag"
                                class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {{ tag }}
                            </span>
                        </div>

                        <p v-if="project.description" class="content-justify text-gray-600 leading-5">
                            {{ project.description }}
                        </p>

                        <div v-if="hasActionLinks(project)" class="flex justify-end gap-1.5 mt-2">
                            <a v-if="project.cred_link?.github" :href="project.cred_link.github" target="_blank"
                                rel="noopener noreferrer"
                                class="border border-[#1980e6] text-[#1980e6] w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-[#1980e6] hover:text-white transition">
                                <v-icon size="16">mdi-github</v-icon>
                            </a>
                            <a v-if="project.cred_link?.website" :href="project.cred_link.website" target="_blank"
                                rel="noopener noreferrer"
                                class="border border-[#01070d] text-[#000000] w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-[#000000] hover:text-white transition">
                                <v-icon size="16">mdi-web</v-icon>
                            </a>
                        </div>
                    </div>
                </v-expand-transition>
            </div>
        </div>

        <div v-else class="text-center text-gray-500 italic">
            <span class="inline-flex items-end gap-2 border-b-2 border-slate-300 pb-0.5">
              <AnimatedIcon name="dino" :size="28" class="-mb-0.5 shrink-0" />
              <span>No Other Projects Yet</span>
            </span>
        </div>
    </div>
</template>

<script setup>
import AnimatedIcon from '@/components/ui/AnimatedIcon.vue'
import { ref } from 'vue'
import { isFeatureEnabled } from '@/config/featureFlags'

const isOpen = ref(isFeatureEnabled('showProjectsPublications.expandProjectSectionsByDefault.otherProjects'))

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

function getTechStack(techStack) {
    if (Array.isArray(techStack)) {
        return techStack
    }

    if (typeof techStack === 'string') {
        return techStack
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)
    }

    return []
}

function hasActionLinks(project) {
    return Boolean(project?.cred_link?.github || project?.cred_link?.website)
}
</script>
