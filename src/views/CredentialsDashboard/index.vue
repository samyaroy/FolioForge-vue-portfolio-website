<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-3xl font-black text-[#0e141b] sm:text-4xl">
              Credentials Dashboard
            </h1>
            <div class="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-slate-900">
              <v-icon size="16">mdi-test-tube</v-icon>
              Beta only
            </div>
          </div>
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

      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <v-data-table
          v-model:page="page"
          class="credentials-table"
          :headers="headers"
          :items="filteredRows"
          :items-per-page="PAGE_SIZE"
          :sort-by="[{ key: 'page', order: 'asc' }]"
          item-value="id"
          density="compact"
          hover
        >
          <!-- Search and the Linked/Empty scope sit in the table's own header
               strip, above the column row. -->
          <template #top>
            <div class="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <v-text-field
                v-model="query"
                type="search"
                aria-label="Search credentials"
                class="credentials-search w-full md:max-w-[420px]"
                placeholder="Search credentials, pages, sections"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                bg-color="white"
                clearable
                hide-details
              />

              <div class="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-1">
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
          </template>

          <template #[`item.page`]="{ item }">
            <div class="font-semibold leading-tight text-slate-900">{{ item.page }}</div>
            <div class="text-xs leading-tight text-slate-500">{{ item.section }}</div>
          </template>

          <template #[`item.detail`]="{ item }">
            <span class="text-slate-600">{{ item.detail || '-' }}</span>
          </template>

          <template #[`item.links`]="{ item }">
            <div v-if="item.links.length" class="flex flex-wrap items-center gap-2">
              <a
                v-for="link in item.links"
                :key="`${item.id}:${link.label}:${link.url}`"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`Open the credential document for ${item.item}`"
                class="inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-[#1980e6]/20 bg-[#1980e6]/5 text-[#126ab5] transition hover:border-[#1980e6]/40 hover:bg-[#1980e6]/10 hover:text-[#0e141b]"
              >
                <v-icon size="14">mdi-open-in-new</v-icon>
              </a>
            </div>
            <span v-else class="text-slate-400">-</span>
          </template>

          <!-- Blank rows so a short last page is as tall as a full one. They
               live outside the sorted, paginated body, so they never mix into
               the data. -->
          <template #[`body.append`]>
            <tr v-for="index in fillerRowCount" :key="`filler-${index}`" aria-hidden="true">
              <td :colspan="headers.length">
                <div class="invisible font-semibold leading-tight">&nbsp;</div>
                <div class="invisible text-xs leading-tight">&nbsp;</div>
              </td>
            </tr>
          </template>

          <template #no-data>
            <div class="px-4 py-12 text-center text-slate-500">
              No credential rows match the current filters.
            </div>
          </template>
        </v-data-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getCredentialDashboardRows } from '@/utils/credentialDashboard'

defineOptions({
  name: 'CredentialsDashboard',
})

const PAGE_SIZE = 20

// Searched fields. `source` is not shown any more but stays searchable, so a
// YAML file name still finds its rows.
const SEARCH_FIELDS = ['page', 'section', 'item', 'detail', 'source'] as const

// Percentage widths, with `table-layout: fixed` in the stylesheet, so a column
// is the same width under All, Linked and Empty. Left to itself the table sizes
// columns from whatever rows are on screen, and the layout jumps as you switch.
const headers = [
  { title: 'Page - Section', key: 'page', width: '20%' },
  { title: 'Credential', key: 'item', width: '37%' },
  { title: 'Detail', key: 'detail', width: '37%' },
  // Icon-only column: the glyph says what it is, so the header stays blank.
  { title: '', key: 'links', sortable: false, width: '6%', align: 'center' as const },
]

const rows = getCredentialDashboardRows()
const query = ref('')
const filter = ref<'all' | 'linked' | 'empty'>('all')
const page = ref(1)

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

    return SEARCH_FIELDS.some((field) =>
      String(row[field] ?? '').toLowerCase().includes(normalizedQuery),
    )
  })
})

// Blank rows pad a short last page so paging doesn't resize the card. Only
// worth it once there is more than one page: a result set that fits on one
// page should just be a short table, not a screen of blank.
const fillerRowCount = computed(() => {
  if (filteredRows.value.length <= PAGE_SIZE) return 0

  const shown = Math.min(
    PAGE_SIZE,
    Math.max(0, filteredRows.value.length - (page.value - 1) * PAGE_SIZE),
  )
  return PAGE_SIZE - shown
})

// A new search or scope starts over at the first page.
watch([query, filter], () => {
  page.value = 1
})
</script>

<style scoped>
.credentials-search :deep(.v-field) {
  min-height: 44px;
  border-radius: 8px;
  color: #0f172a;
}

.credentials-search :deep(.v-field__input) {
  min-height: 44px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 0.875rem;
}

.credentials-search :deep(.v-field--focused .v-field__outline) {
  color: #1980e6;
}

/* Vuetify's table chrome, restyled to the slate/#1980e6 palette the rest of
   this page uses. Rows size to their content -- the page height is held steady
   by the blank rows in `body.append`, not by pinning pixels. */
/* Widths come from the `headers` percentages rather than from the rows, so
   they hold steady across the All/Linked/Empty scopes. */
.credentials-table :deep(table) {
  table-layout: fixed;
}

.credentials-table :deep(thead th) {
  height: 44px;
  background: #f1f5f9 !important;
  color: #475569 !important;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.credentials-table :deep(tbody td) {
  border-bottom: 1px solid #f1f5f9 !important;
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
  font-size: 0.875rem;
  color: #0f172a;
  overflow-wrap: anywhere;
}

.credentials-table :deep(tbody tr:hover) {
  background: #f8fafc;
}

.credentials-table :deep(.v-data-table-footer) {
  border-top: 1px solid #e2e8f0;
  font-size: 0.8125rem;
  color: #475569;
}

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
