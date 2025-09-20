<template>
    <div class="grid grid-cols-[40px_1fr] gap-x-2 px-4">
        <!-- Timeline Icon & Connector -->
        <div class="flex flex-col items-center gap-1" :class="{ 'pb-3': isLast }">
            <!-- Top connector -->
            <div v-if="!isFirst" class="w-[1.5px] bg-[#d0dbe7] h-2"></div>

            <!-- Icon -->
            <div class="text-[#0e141b]">
                <v-icon :class="iconColor" size="24">{{ icon }}</v-icon>
            </div>

            <!-- Bottom connector -->
            <div v-if="!isLast" class="w-[1.5px] bg-[#d0dbe7] h-2 grow"></div>
        </div>

        <!-- Education Info -->
        <div class="flex flex-1 flex-col py-3">
            <div class="flex items-center gap-2">
                <p class="text-[#0e141b] text-base font-medium leading-normal">{{ title }} <span v-if="subject">in {{ subject }}</span></p>
                <a v-if="cred_link" :href="cred_link" target="_blank" rel="noopener noreferrer">
                    <v-icon size="20">mdi-file-document-outline</v-icon>
                </a>
            </div>
            <!-- Time -->
            <div class="flex items-center gap-2 mt-1">
                <v-icon class="text-[#4e7397]" size="16">mdi-calendar</v-icon>
                <p class="text-[#4e7397] text-base font-normal leading-normal">{{ time }}</p>
            </div>

            <!-- Institution + Location in same line -->
            <div class="flex items-center gap-6 mt-1">
                <!-- Institution -->
                <div class="flex items-center gap-2">
                    <v-icon class="text-[#4e7397]" size="16">mdi-domain</v-icon>
                    <p class="text-[#4e7397] text-sm font-normal leading-normal">{{ institution }}</p>
                </div>

                <!-- Location -->
                <div class="flex items-center gap-2">
                    <v-icon class="text-[#4e7397]" size="16">mdi-map-marker</v-icon>
                    <p class="text-[#4e7397] text-sm font-normal leading-normal">{{ location }}</p>
                </div>
            </div>

            <!-- Extra info (Marks/CGPA)
      <div class="flex items-center gap-2 mt-1" v-if="extra">
        <v-icon class="text-[#4e7397]" size="16">mdi-star</v-icon>
        <p class="text-[#4e7397] text-sm font-normal leading-normal">{{ extra }}</p>
      </div> -->
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: { type: String, required: true },
    subject: { type: String, default: '' }, // Optional, e.g., "in Computer Science"
    time: { type: String, required: true },
    institution: { type: String, required: true },
    location: { type: String, required: true },
    extra: { type: String, default: '' }, // ✅ Marks or CGPA
    icon: { type: String, default: 'mdi-school' }, // ✅ customizable icon
    iconColor: { type: String, default: 'text-[#1980e6]' }, // ✅ customizable color
    isFirst: { type: Boolean, default: false }, // for controlling top connector
    isLast: { type: Boolean, default: false },   // for controlling bottom connector
    cred_link: { type: String, default: '' } // Link to certificate or document
})
</script>