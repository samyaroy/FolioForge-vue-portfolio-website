<template>
    <div class="bg-white rounded-lg shadow-sm p-8">
        <h2 class="text-2xl font-bold text-[#0e141b] mb-6">Academic Projects</h2>
        <div v-if="projects && projects.length > 0" class="space-y-6">
            <div v-for="project in projects" :key="project.id" :id="`research-${project.id}`" class="border-l-4 border-[#1980e6] pl-6 py-4">
                <h3 class="text-lg font-semibold text-[#0e141b] mb-2">{{ project.title }}</h3>
                <p class="text-gray-600 mb-2"><v-icon>mdi-school</v-icon> {{ project.type }}</p>
                <div class="flex items-starts gap-2">
                    <p class="text-gray-600 mb-0 flex items-start">
                        <v-icon class="mr-1">mdi-account-tie</v-icon> Supervisor:
                    </p>
                    <p class="text-gray-600 mb-0 flex items-center">
                        {{ project.guide }}
                    </p>
                </div>
                <p class="text-sm text-gray-600 mb-3 mt-2"><v-icon>mdi-calendar-blank</v-icon> {{ project.time_period }}</p>
                <p v-if="project.doi" class="text-sm text-gray-600 mb-3 flex items-center gap-1">
                    <v-icon size="16">mdi-web</v-icon>
                    <a :href="`https://doi.org/${project.doi}`" target="_blank" class="text-blue-600 hover:underline">
                        {{ project.doi }}
                    </a>
                </p>
                <p v-if="project.colaborator && project.colaborator.length"
                    class="text-sm text-gray-600 mb-3 flex items-center gap-1">
                    <v-icon size="16">mdi-account-supervisor</v-icon>
                    Colaborators: {{ project.colaborator.join(', ') }}
                </p>
                <p class="text-gray-700 mb-3">{{ project.description }}</p>
                <div class="flex flex-wrap gap-2">
                    <span v-for="tag in project.keywords" :key="tag"
                        class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {{ tag }}
                    </span>
                </div>
            </div>
        </div>
        <div v-else class="text-center text-gray-500 italic">
            No Conceptual Projects Yet
        </div>
    </div>
</template>

<script setup>
defineProps({
    projects: {
        type: Array,
        default: () => []
    }
})
</script>