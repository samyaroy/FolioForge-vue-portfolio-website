<template>
  <div class="min-h-screen bg-[#eef3f8] py-8">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div class="mb-12">
        <h1 class="text-3xl sm:text-4xl font-black text-[#0e141b] tracking-[-0.033em]"
          :class="{ 'mb-4': showPageDescription }">
          <v-icon size="0.9em" class="mr-2 align-[-0.08em]">mdi-sitemap-outline</v-icon>
          Sitemap
        </h1>
        <p v-if="showPageDescription" class="text-lg text-gray-600 max-w-4xl">
          {{ pageDescription }}
        </p>
      </div>

      <!-- Columns rather than a grid: the groups run from two links to a dozen,
           and a grid row would stretch every short group to the tallest one. -->
      <div class="gap-10 md:columns-2 lg:columns-3">
        <section
          v-for="group in groups"
          :key="group.title"
          class="mb-8 break-inside-avoid border-t border-slate-300 pt-4"
        >
          <h2 class="flex items-baseline gap-2 text-lg font-bold text-[#0e141b]">
            <v-icon size="20" class="text-slate-500">{{ group.icon }}</v-icon>
            {{ group.title }}
            <span class="text-sm font-medium text-slate-400">{{ group.entries.length }}</span>
          </h2>
          <ul class="mt-3 list-disc space-y-3 pl-4 marker:text-slate-400">
            <li v-for="entry in group.entries" :key="entry.href">
              <router-link v-if="entry.route" :to="entry.href" :class="ENTRY_LINK_CLASS">
                {{ entry.label }}
              </router-link>
              <a
                v-else
                :href="entry.href"
                :class="ENTRY_LINK_CLASS"
                v-bind="entry.external ? { target: '_blank', rel: 'noopener' } : {}"
              >
                {{ entry.label }}
                <v-icon v-if="entry.external" size="12" class="ml-0.5 align-baseline">mdi-open-in-new</v-icon>
              </a>
              <p class="mt-0.5 text-xs text-slate-500">
                <span class="font-mono break-all">{{ displayHref(entry.href) }}</span>
              </p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import config from '@/content/profile_info/site'
import descriptions from '@/content/profile_info/description.yml'
import { isFeatureEnabled, isPageDescriptionEnabled } from '@/config/featureFlags'
import { isBetaSite } from '@/config/siteEnvironment'
import { BLOG_URL, routeMetadata } from '@/router/routes'

defineOptions({
  name: 'SitemapPage',
})

const ENTRY_LINK_CLASS =
  'text-sm font-medium text-[#0e141b] transition-colors duration-200 hover:text-[#1980e6]'

const pageDescription = descriptions.sitemap
const showPageDescription = isPageDescriptionEnabled('sitemap')

const blogLink = config.socials.blog
// The same check as the header's Blog link, so the two never disagree.
const showBlog = isFeatureEnabled('showBlog') && Boolean(blogLink)

// Mirrors the router's guard, so every page listed here resolves instead of
// redirecting to Home; vite.config.ts filters sitemap.xml the same way.
const pageEntries = routeMetadata
  .filter(route => route.name !== 'Sitemap')
  .filter(route => !route.betaOnly || isBetaSite())
  .filter(route => !route.flagPath || isFeatureEnabled(route.flagPath, { mode: route.flagMode }))
  .map(route => ({ label: route.title ?? 'Home', href: route.path, route: true }))

// `route` entries go through the router; the rest are static files on this
// host (fetched by the browser, not the router) or pages on the blog.
const groups = [
  {
    title: 'Pages',
    icon: 'mdi-file-document-multiple-outline',
    entries: [
      ...pageEntries,
      ...(showBlog ? [{ label: 'Blog', href: blogLink, external: true }] : []),
    ],
  },
  {
    title: 'Feeds',
    icon: 'mdi-rss',
    entries: [
      // The portfolio has no dated content of its own; the feed lives on the blog.
      ...(showBlog ? [{ label: 'RSS feed', href: `${BLOG_URL}/rss.xml`, external: true }] : []),
      { label: 'XML sitemap', href: '/sitemap.xml' },
    ],
  },
]

const displayHref = href => href.replace(/^https?:\/\//, '')
</script>
