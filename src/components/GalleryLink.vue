<template>
  <!-- A round image icon that opens one gallery card: the gallery page reads
       `?item=`, scrolls to that card and highlights it (see
       views/Gallery/index.vue). Renders nothing when the gallery is off or the
       id names no published post, so a card never offers a dead link. -->
  <RouterLink
    v-if="item"
    :to="{ path: '/gallery', query: { [GALLERY_ITEM_PARAM]: item.id } }"
    :aria-label="`See ${label} in the gallery`"
    :title="`In the gallery: ${label}`"
    :class="{ shadow: !shadowless }"
    class="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[#1980e6] text-[#1980e6] transition hover:bg-[#1980e6] hover:text-white"
  >
    <v-icon size="16">mdi-image-outline</v-icon>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import galleryContent from '@/content/profile_info/gallery.yml'
import { isEntryEnabled } from '@/config/entryStatus'
import { isFeatureEnabled } from '@/config/featureFlags'
import { GALLERY_ITEM_PARAM } from '@/utils/shareLinks'

interface GalleryItem {
  id?: string
  title?: string
}

const props = defineProps<{
  /** The gallery post's `id` in gallery.yml, such as `competition-01`. */
  itemId?: string | null
  /** Omit the shadow when used as a floating card action. */
  shadowless?: boolean
}>()

const galleryItems: GalleryItem[] = Array.isArray(galleryContent?.items)
  ? galleryContent.items.filter(isEntryEnabled)
  : []

const item = computed(() => {
  const id = String(props.itemId ?? '').trim()
  if (!id || !isFeatureEnabled('showGallery')) return null
  return galleryItems.find(entry => entry.id === id) ?? null
})

const label = computed(() => item.value?.title || 'this post')
</script>
