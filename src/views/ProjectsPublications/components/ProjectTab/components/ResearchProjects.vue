<template>
    <div class="bg-white rounded-lg shadow-sm p-8">
        <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Academic Projects</h2>
        <div v-if="projects && projects.length > 0" class="space-y-6">
            <div v-for="(project, index) in projects" :key="index" :id="`research-${index}`"
                class="border-l-4 border-[#1980e6] pl-6 py-4">
                <h3 class="text-lg font-semibold text-[#0e141b] mb-2">{{ project.title }}</h3>
                <p class="text-gray-600 mb-2"><v-icon>mdi-school</v-icon> {{ project.affiliation }}</p>
                <div class="flex items-starts gap-2">
                    <p class="text-gray-600 mb-0 flex items-start">
                        <v-icon class="mr-1">mdi-account-tie</v-icon> Supervisor:
                    </p>
                    <p class="text-gray-600 mb-0 flex items-center" v-if="project.guide && project.guide.name">
                        <span>
                            <SmartLink :type="'Person'" :text="project.guide.name" />
                        </span><span v-if="project.guide.title">, {{ project.guide.title }}</span><span
                            v-if="project.guide.department">, {{ project.guide.department }}</span><span
                            v-if="project.guide.institution">, {{ project.guide.institution }}</span>
                    </p>
                </div>
                <p class="text-sm text-gray-600 mb-3 mt-2"><v-icon>mdi-calendar-blank</v-icon> {{ project.time_period }}
                </p>
                <p v-if="project.doi" class="text-sm text-gray-600 mb-3 flex items-center gap-1">
                    <v-icon size="16">mdi-web</v-icon>
                    <a :href="`https://doi.org/${project.doi}`" target="_blank" class="text-blue-600 hover:underline">
                        {{ project.doi }}
                    </a>
                </p>
                <p v-if="project.colaborators && project.colaborators.length"
                    class="text-sm text-gray-600 mb-3 flex items-center gap-1">
                    <v-icon size="16">mdi-account-supervisor</v-icon>
                    Colaborators:
                    <template v-for="(colab, index) in project.colaborators.split(',')" :key="colab">
                        <SmartLink :type="'Person'" :text="colab.trim()" />
                        <span v-if="index < project.colaborators.split(',').length - 1">, </span>
                    </template>
                </p>
                <p class="text-gray-700 mb-3">{{ project.description }}</p>
                <div class="flex flex-wrap gap-2">
                    <span v-for="tag in Array.isArray(project.tech_stack)
                        ? project.tech_stack
                        : project.tech_stack.split(',').map(item => item.trim())" :key="tag"
                        class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {{ tag }}
                    </span>

                </div>
                <div class="flex justify-end items-center">
                    <a v-if="project.cred_link && project.cred_link?.researchgate"
                        :href="project.cred_link.researchgate" target="_blank"
                        class="px-2 mx-1 icon-wrapper border border-[#1980e6] text-[#1980e6] w-10 h-10 rounded-full flex items-center justify-center shadow hover:bg-[#1980e6] hover:text-white transition">
                        <v-icon class="circle-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="icon-svg">
                                <path
                                    d="M0 32v448h448V32H0zm262.2 334.4c-6.6 3-33.2 6-50-14.2-9.2-10.6-25.3-33.3-42.2-63.6-8.9 0-14.7 0-21.4-.6v46.4c0 23.5 6 21.2 25.8 23.9v8.1c-6.9-.3-23.1-.8-35.6-.8-13.1 0-26.1.6-33.6.8v-8.1c15.5-2.9 22-1.3 22-23.9V225c0-22.6-6.4-21-22-23.9V193c25.8 1 53.1-.6 70.9-.6 31.7 0 55.9 14.4 55.9 45.6 0 21.1-16.7 42.2-39.2 47.5 13.6 24.2 30 45.6 42.2 58.9 7.2 7.8 17.2 14.7 27.2 14.7v7.3zm22.9-135c-23.3 0-32.2-15.7-32.2-32.2V167c0-12.2 8.8-30.4 34-30.4s30.4 17.9 30.4 17.9l-10.7 7.2s-5.5-12.5-19.7-12.5c-7.9 0-19.7 7.3-19.7 19.7v26.8c0 13.4 6.6 23.3 17.9 23.3 14.1 0 21.5-10.9 21.5-26.8h-17.9v-10.7h30.4c0 20.5 4.7 49.9-34 49.9zm-116.5 44.7c-9.4 0-13.6-.3-20-.8v-69.7c6.4-.6 15-.6 22.5-.6 23.3 0 37.2 12.2 37.2 34.5 0 21.9-15 36.6-39.7 36.6z"
                                    fill="#1980e6" />
                            </svg>
                        </v-icon>
                    </a>
                    <a v-if="project.cred_link && project.cred_link?.github" :href="project.cred_link.github"
                        target="_blank"
                        class="border border-[#1980e6] text-[#1980e6] px-2 mx-1 w-10 h-10 rounded-full flex items-center justify-center shadow hover:bg-[#1980e6] hover:text-white transition">
                        <v-icon>mdi-github</v-icon>
                    </a>

                </div>
            </div>
        </div>
        <div v-else class="text-center text-gray-500 italic">
            No Conceptual Projects Yet
        </div>
    </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'

defineProps({
    projects: {
        type: Object,
        default: () => []
    }
})
</script>

<style scoped>

.icon-wrapper:hover .circle-icon .icon-svg path {
    fill: #ffffff;
}

.icon-wrapper:hover .circle-icon {
    background: #1980e6;
}

.circle-icon {
    width: 19px;
    height: 23px;
    border-radius: 60%;
    background: #e9f3ff;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    transition: background-color 0.2s ease;
    cursor: pointer;
}

.icon-svg path {
    transition: fill 0.2s ease;
}

/* HOVER EFFECT */
.circle-icon:hover {
    background: #1980e6;
    /* background changes */
}

.circle-icon:hover .icon-svg path {
    fill: #ffffff;
    /* icon color changes */
}
</style>