<template>
  <div class="relative flex size-full min-h-screen flex-col bg-slate-50 overflow-x-hidden">
    <div class="layout-container flex h-full grow flex-col">
      <div class="px-8 md:px-16 lg:px-20 flex flex-1 justify-center py-10">
        <div class="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
          <div class="mb-10 text-center">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-[#4e7397]">
              Privacy Policy
            </p>
            <h1 class="mt-3 text-4xl font-black tracking-[-0.033em] text-[#0e141b]">
              Your information stays treated with care.
            </h1>
          </div>

          <ul class="list-disc space-y-4 pl-6 text-slate-600 marker:text-[#1980e6]">
            <li class="content-justify">
              <span class="font-semibold text-[#0e141b]">Information shown on this site:</span>
              The content on this website is curated portfolio information such as profile details, education, projects, publications, and public contact links.
            </li>
            <li class="content-justify">
              <span class="font-semibold text-[#0e141b]">How information may be used:</span>
              Information shared here is meant for networking, collaboration, academic visibility, recruitment, and professional outreach.
            </li>
            <li class="content-justify">
              <span class="font-semibold text-[#0e141b]">External services and links:</span>
              This site may point to third-party platforms such as GitHub, LinkedIn, Google Drive, Google Scholar, and ResearchGate. Those services have their own privacy practices and terms.
            </li>
            <li class="content-justify">
              <span class="font-semibold text-[#0e141b]">Analytics and hosting:</span>
              Basic hosting or visitor statistics tools may collect standard technical data like browser details, page requests, and approximate usage patterns to keep the site available and improve performance.
            </li>
            <li class="content-justify">
              <span class="font-semibold text-[#0e141b]">Contact:</span>
              For privacy-related questions, corrections, or removal requests, please reach out at
              <a :href="emailLink" class="font-semibold text-[#0f62fe] hover:text-[#0842a0]">{{ email }}</a>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import config from '@/content/profile_info'

const email = config.contacts.email
const emailLink = `mailto:${email}`
</script>
