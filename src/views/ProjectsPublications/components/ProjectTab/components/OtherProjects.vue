<template>
    <div class="bg-white rounded-lg shadow-sm p-8">
        <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Other Projects</h2>

        <div v-if="projects && projects.length" class="space-y-6">
            <div v-for="(project, index) in projects" :key="project.title || index" :id="`minor-${index}`"
                class="border-l-4 border-[#1980e6] pl-6 pt-4 pb-2 pr-4 rounded-md bg-slate-50">
                <div class="flex items-start justify-between gap-4 pb-4">
                    <h3 class="text-lg font-semibold text-[#0e141b]">
                        {{ project.title }}
                    </h3>
                    <div v-if="project.time_period" class="text-sm text-gray-600 flex items-center gap-1 shrink-0">
                        <v-icon size="16">mdi-calendar-blank</v-icon>
                        {{ project.time_period }}
                    </div>
                </div>
                <div class="flex flex-col md:flex-row items-stretch">
                    <div class="w-full md:w-[95%] md:pr-6">
                        <div v-if="project.affiliation" class="flex items-start gap-2 mb-2">
                            <v-icon class="text-gray-600">mdi-school</v-icon>
                            <p class="text-gray-600">
                                {{ project.affiliation }}
                            </p>
                        </div>

                        <div v-if="project.guide?.name" class="flex items-start gap-2 mb-2">
                            <div class="text-gray-600 flex items-start">
                                <v-icon class="mr-1">mdi-account-tie</v-icon>
                                Guide:
                            </div>
                            <div class="text-gray-600">
                                <SmartLink :type="'Person'" :text="project.guide.name" />
                                <span v-if="project.guide.title">, {{ project.guide.title }}</span>
                                <span v-if="project.guide.department">, {{ project.guide.department }}</span>
                                <span v-if="project.guide.institution">
                                    ,
                                    <SmartLink :text="project.guide.institution" />
                                </span>
                            </div>
                        </div>



                        <p class="text-gray-700 mb-3">
                            {{ project.description }}
                        </p>

                        <div v-if="getTechStack(project.tech_stack).length" class="flex flex-wrap gap-1">
                            <span v-for="tag in getTechStack(project.tech_stack)" :key="tag"
                                class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {{ tag }}
                            </span>
                        </div>
                    </div>

                    <div
                        class="w-full md:w-[5%] flex flex-col items-start justify-start gap-3 md:items-center mt-4 md:mt-0">
                        <img v-for="logo in getLogos(project.logo)" :key="logo" :src="getLogoPath(logo)" :alt="logo"
                            :title="logo" class="max-h-8 md:max-h-12 object-contain opacity-90">
                    </div>
                </div>

                <div v-if="hasActionLinks(project)" class="flex justify-end items-center mt-1">
                    <v-tooltip v-if="project.cred_link?.report" location="top">
                        <template #activator="{ props }">
                            <a v-bind="props" :href="project.cred_link.report" target="_blank" rel="noopener noreferrer"
                                class="px-1 mx-1 border border-[#1980e6] text-[#1980e6] w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-[#1980e6] hover:text-white transition">
                                <v-icon size="16">mdi-notebook</v-icon>
                            </a>
                        </template>
                        <span>Project Report</span>
                    </v-tooltip>

                    <v-tooltip v-if="project.cred_link?.github" location="top">
                        <template #activator="{ props }">
                            <a v-bind="props" :href="project.cred_link.github" target="_blank" rel="noopener noreferrer"
                                class="border border-[#1980e6] text-[#1980e6] px-1 mx-1 w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-[#1980e6] hover:text-white transition">
                                <v-icon size="16">mdi-github</v-icon>
                            </a>
                        </template>
                        <span>GitHub Repository</span>
                    </v-tooltip>

                    <v-tooltip v-if="project.cred_link?.website" location="top">
                        <template #activator="{ props }">
                            <a v-bind="props" :href="project.cred_link.website" target="_blank"
                                rel="noopener noreferrer"
                                class="border border-[#1980e6] text-[#1980e6] px-1 mx-1 w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-[#1980e6] hover:text-white transition">
                                <v-icon size="16">mdi-web</v-icon>
                            </a>
                        </template>
                        <span>Project Website</span>
                    </v-tooltip>
                </div>
            </div>
        </div>

        <div v-else class="text-center text-gray-500 italic">
            No Minor Projects Yet
        </div>
    </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'

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

function getLogos(logo) {
    if (Array.isArray(logo)) {
        return logo
    }

    if (typeof logo === 'string' && logo.trim()) {
        return [logo.trim()]
    }

    return []
}

function hasActionLinks(project) {
    return Boolean(
        project?.cred_link?.report ||
        project?.cred_link?.github ||
        project?.cred_link?.website
    )
}

function getLogoPath(logo) {
    return `/logo/${logo}.png`
}
</script>
