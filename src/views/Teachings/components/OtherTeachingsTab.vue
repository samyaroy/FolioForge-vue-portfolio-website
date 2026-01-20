<template>
    <div class="bg-white rounded-lg shadow-sm p-8">
        <h2 class="text-2xl font-bold text-[#0e141b] mb-6">
            Other Teaching Activities
        </h2>

        <div v-if="items && items.length" class="space-y-6">
            <div v-for="item in items" :key="item.title" class="border-l-4 border-blue-500 bg-gray-50 pl-6 py-4 rounded-lg ">
                <!-- Header -->
                <div class="flex items-start justify-between mb-2">
                    <h3 class="text-lg font-bold text-[#0e141b]">
                        {{ item.title }}
                    </h3>

                    <span v-if="item.duration" class="text-xs font-medium px-2 py-1 rounded">
                        {{ item.duration }}
                    </span>
                </div>

                <!-- Meta -->
                <div class="space-y-1 text-slate-600">
                    <p v-if="item.institution" class="flex items-center">
                        <v-icon size="18" class="mr-2">mdi-domain</v-icon>
                        <SmartLink :href="item.link" :text="item.institution"></SmartLink>
                    </p>

                    <p v-if="item.role" class="flex items-center">
                        <v-icon size="18" class="mr-2">mdi-account-tie</v-icon>
                        <span class="font-medium">Role:</span>&nbsp;
                        {{ item.role }}
                    </p>

                    <p v-if="item.audience" class="flex items-center">
                        <v-icon size="18" class="mr-2">mdi-account-group</v-icon>
                        <span class="font-medium">Audience:</span>&nbsp;
                        {{ item.audience }}
                    </p>

                    <p v-if="item.students" class="flex items-center">
                        <v-icon size="18" class="mr-2">mdi-counter</v-icon>
                        {{ item.students }}
                    </p>
                </div>

                <!-- Description -->
                <p v-if="item.description" class="text-slate-700 leading-relaxed mt-2">
                    {{ item.description }}
                </p>
            </div>
        </div>

        <div v-else class="text-center text-gray-500 italic">
            No additional teaching activities listed
        </div>
    </div>
</template>

<script setup>
import SmartLink from '@/components/SmartLink.vue'

defineProps({
    items: {
        type: Array,
        default: () => []
    }
})
</script>