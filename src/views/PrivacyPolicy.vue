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
            <p class="content-justify mx-auto mt-4 max-w-3xl text-base text-slate-600 md:text-lg">
              This portfolio is intended to share professional work, academic activity, and contact details in a clear public format.
            </p>
          </div>

          <div class="space-y-6">
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 class="text-2xl font-bold text-[#0e141b]">Information shown on this site</h2>
              <p class="content-justify mt-3 text-slate-600">
                The content on this website is curated portfolio information such as profile details, education, projects, publications, and public contact links.
              </p>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 class="text-2xl font-bold text-[#0e141b]">How information may be used</h2>
              <p class="content-justify mt-3 text-slate-600">
                Information shared here is meant for networking, collaboration, academic visibility, recruitment, and professional outreach.
              </p>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 class="text-2xl font-bold text-[#0e141b]">External services and links</h2>
              <p class="content-justify mt-3 text-slate-600">
                This site may point to third-party platforms such as GitHub, LinkedIn, Google Drive, Google Scholar, and ResearchGate. Those services have their own privacy practices and terms.
              </p>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 class="text-2xl font-bold text-[#0e141b]">Analytics and hosting</h2>
              <p class="content-justify mt-3 text-slate-600">
                Basic hosting or visitor statistics tools may collect standard technical data like browser details, page requests, and approximate usage patterns to keep the site available and improve performance.
              </p>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 class="text-2xl font-bold text-[#0e141b]">Contact</h2>
              <p class="content-justify mt-3 text-slate-600">
                For privacy-related questions, corrections, or removal requests, please reach out at
                <a :href="emailLink" class="font-semibold text-[#0f62fe] hover:text-[#0842a0]">
                  {{ email }}
                </a>.
              </p>
              <p class="mt-3 text-sm text-slate-500">
                Last updated: {{ lastUpdatedOn }}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import config from '@/profile_info.yml'

const email = config.contacts.email
const emailLink = `mailto:${email}`
const lastUpdatedOn = config.last_updated_on
</script>
