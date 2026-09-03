<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-slate-900">
            <v-icon size="16">mdi-test-tube</v-icon>
            Beta only
          </div>
          <h1 class="text-3xl font-black text-[#0e141b] sm:text-4xl">
            Credentials Dashboard
          </h1>
          <p class="mt-3 max-w-3xl text-base text-slate-600 sm:text-lg">
            Credential entries discovered from the portfolio YAML content.
          </p>
        </div>

        <div class="grid grid-cols-3 gap-3 text-center sm:min-w-[360px]">
          <div class="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <div class="text-2xl font-black text-[#0e141b]">{{ rows.length }}</div>
            <div class="text-xs font-semibold uppercase text-slate-500">Total</div>
          </div>
          <div class="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <div class="text-2xl font-black text-emerald-700">{{ linkedCount }}</div>
            <div class="text-xs font-semibold uppercase text-slate-500">Linked</div>
          </div>
          <div class="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <div class="text-2xl font-black text-rose-700">{{ missingCount }}</div>
            <div class="text-xs font-semibold uppercase text-slate-500">Empty</div>
          </div>
        </div>
      </div>

      <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label class="relative block md:w-[420px]">
          <v-icon size="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            mdi-magnify
          </v-icon>
          <input
            v-model="query"
            type="search"
            class="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#1980e6] focus:ring-2 focus:ring-[#1980e6]/20"
            placeholder="Search credentials, sections, sources"
          >
        </label>

        <div class="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            type="button"
            class="dashboard-filter-button"
            :class="{ 'dashboard-filter-button--active': filter === option.value }"
            @click="filter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead class="bg-slate-100 text-xs font-bold uppercase text-slate-600">
              <tr>
                <th scope="col" class="whitespace-nowrap px-4 py-3">Section</th>
                <th scope="col" class="min-w-[260px] px-4 py-3">Credential</th>
                <th scope="col" class="min-w-[220px] px-4 py-3">Detail</th>
                <th scope="col" class="whitespace-nowrap px-4 py-3">Date</th>
                <th scope="col" class="min-w-[220px] px-4 py-3">Cred Link</th>
                <th scope="col" class="min-w-[240px] px-4 py-3">YAML Path</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="row in filteredRows" :key="row.id" class="align-top transition hover:bg-slate-50">
                <td class="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{{ row.section }}</td>
                <td class="px-4 py-3 text-slate-900">{{ row.item }}</td>
                <td class="px-4 py-3 text-slate-600">{{ row.detail || '-' }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ row.date || '-' }}</td>
                <td class="px-4 py-3">
                  <div v-if="row.links.length" class="flex flex-col gap-2">
                    <a
                      v-for="link in row.links"
                      :key="`${row.id}:${link.label}:${link.url}`"
                      :href="link.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex w-fit items-center gap-1.5 rounded-md border border-[#1980e6]/20 bg-[#1980e6]/5 px-2.5 py-1 text-xs font-bold text-[#126ab5] transition hover:border-[#1980e6]/40 hover:bg-[#1980e6]/10 hover:text-[#0e141b]"
                    >
                      <v-icon size="14">mdi-open-in-new</v-icon>
                      {{ link.label }}
                    </a>
                  </div>
                  <span v-else class="text-slate-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <code class="break-all rounded bg-slate-100 px-1.5 py-1 text-xs text-slate-700">
                    {{ row.source }}{{ row.configPath ? `:${row.configPath}` : '' }}
                  </code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredRows.length === 0" class="px-4 py-12 text-center text-slate-500">
          No credential rows match the current filters.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getCredentialDashboardRows } from '@/utils/credentialDashboard'

defineOptions({
  name: 'CredentialsDashboard',
})

const rows = getCredentialDashboardRows()
const query = ref('')
const filter = ref<'all' | 'linked' | 'empty'>('all')

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'linked', label: 'Linked' },
  { value: 'empty', label: 'Empty' },
] as const

const linkedCount = computed(() => rows.filter((row) => row.hasLink).length)
const missingCount = computed(() => rows.length - linkedCount.value)

const filteredRows = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()

  return rows.filter((row) => {
    if (filter.value === 'linked' && !row.hasLink) return false
    if (filter.value === 'empty' && row.hasLink) return false
    if (!normalizedQuery) return true

    return [
      row.section,
      row.item,
      row.detail,
      row.date,
      row.source,
      row.configPath,
      ...row.links.flatMap((link) => [link.label, link.url]),
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  })
})
</script>

<style scoped>
.dashboard-filter-button {
  min-width: 72px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  padding: 0.45rem 0.75rem;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  box-shadow: none;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.dashboard-filter-button:hover,
.dashboard-filter-button:focus,
.dashboard-filter-button:focus-visible {
  border: 0;
  outline: 0;
  background: #f1f5f9;
  color: #0e141b;
  box-shadow: none;
}

.dashboard-filter-button--active,
.dashboard-filter-button--active:hover,
.dashboard-filter-button--active:focus,
.dashboard-filter-button--active:focus-visible {
  background: #1980e6;
  color: #ffffff;
}
</style>
