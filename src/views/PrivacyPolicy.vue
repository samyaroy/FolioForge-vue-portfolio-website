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
            <p class="mt-4 text-sm text-slate-600">
              Last updated: <time datetime="2026-10-07">October 7, 2026</time>
            </p>
          </div>

          <ul class="list-disc space-y-4 pl-6 text-slate-600 marker:text-[#1980e6]">
            <li class="content-justify">
              <span class="font-semibold text-[#0e141b]">Information shown on this site:</span>
              The content on this website is curated portfolio information such as profile details, education, projects, publications, and public contact links.
            </li>
            <li class="content-justify">
              <span class="font-semibold text-[#0e141b]">Information you provide:</span>
              This public portfolio does not offer visitor accounts, login, or contact forms. Contact links open your email application or a third-party platform. If you send an email, your email address and message are used to respond to your enquiry.
            </li>
            <li class="content-justify">
              <span class="font-semibold text-[#0e141b]">Hosting and technical data:</span>
              Hosting and content delivery providers may process standard request information, such as your IP address, browser details, requested pages, and request times, to deliver the site, maintain security, and diagnose errors.
            </li>
            <li class="content-justify">
              <span class="font-semibold text-[#0e141b]">Certification badge summary:</span>
              The Certifications page may request a public summary of my Credly badges from a hosted endpoint. This request retrieves badge counts and issuer information; it does not ask for your Credly account or login details. The endpoint's hosting provider may process standard technical request data.
            </li>
            <li class="content-justify">
              <span class="font-semibold text-[#0e141b]">External services and links:</span>
              This site links to third-party platforms such as Credly, GitHub, LinkedIn, Google Drive, Google Scholar, and ResearchGate. Opening those links, or loading content hosted by another provider, may share standard request information with that provider. Those services have their own privacy practices and terms.
            </li>
            <li class="content-justify">
              <span class="font-semibold text-[#0e141b]">Cookies and analytics:</span>
              The portfolio application does not currently set its own cookies or use visitor analytics scripts. Third-party services may handle cookies or other identifiers under their own policies when you access them.
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

// The policy's contact-of-record is the personal gmail address (it was
// contacts.email before that key was renamed to contacts.gmail).
const email = config.contacts.gmail
const emailLink = `mailto:${email}`
</script>
