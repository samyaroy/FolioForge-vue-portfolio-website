<template>
  <!-- Sits straight on the page background: the GIF is transparent, so the
       fish swims on the slate-50 with no box around it. -->
  <section v-if="!failed" class="flex flex-col gap-3" aria-labelledby="github-koi-heading">
    <div class="h-px bg-slate-200" aria-hidden="true"></div>

    <div class="flex flex-wrap items-center justify-center gap-x-32 gap-y-4">
      <!-- 256px is half the GIF's 512px, so every art pixel lands on exactly
           two CSS pixels and `pixelated` keeps the edges crisp. -->
      <picture class="block size-64 max-w-full shrink-0">
        <source v-if="still" :srcset="still" media="(prefers-reduced-motion: reduce)" />
        <img
          :src="gif"
          alt="My GitHub koi, a pixel-art fish redrawn every night from my GitHub activity"
          width="256"
          height="256"
          loading="lazy"
          decoding="async"
          class="size-full [image-rendering:pixelated]"
          @error="failed = true"
        />
      </picture>

      <div class="flex min-w-0 max-w-[640px] flex-[0_1_640px] flex-col items-start gap-4 text-left">
        <div class="flex flex-col items-start gap-2">
          <!-- The asterisk points to the source note at the bottom of the section. -->
          <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1565c0]">
            Today's koi<sup class="ml-0.5 text-[10px]" aria-hidden="true">*</sup>
          </span>
          <!-- The note sits beside the heading, not inside it, so the section's
               accessible name stays "Meet my GitHub koi". -->
          <div class="flex flex-wrap items-baseline gap-x-2">
            <h2 id="github-koi-heading" class="text-2xl font-extrabold tracking-[-0.02em] text-[#0e141b]">
              Meet my GitHub koi
            </h2>
            <span class="text-xs text-slate-500">(Updated daily)</span>
          </div>
          <p class="text-[15px] leading-relaxed text-slate-600">
            It's redrawn every night from my public GitHub activity.<br />
            Different prog. languages color it, contributions grow it, and streaks mark it.
          </p>
        </div>      </div>
    </div>

    <!-- The asterisk's note. The koi is the last thing on the Contact page, so this
         lands just above the page quote, on the right. It hides with the koi. -->
    <p class="mt-5 self-end text-right text-xs text-slate-500">
      <span class="text-[#1565c0]" aria-hidden="true">*</span>
      Drawn with git-koi by Anthony Yalong · Source:
      <a
        href="https://github.com/yalongwastaken/git-koi"
        target="_blank"
        rel="noopener noreferrer"
        class="underline transition-colors duration-200 hover:text-[#1980e6]"
      >github.com/yalongwastaken/git-koi</a>
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  /** The animated koi. */
  gif: string
  /** Still frame for visitors who ask for reduced motion. */
  still?: string
}>()

// The image is redrawn nightly onto the media host by .github/workflows/koi.yml.
// Until that workflow has drawn its first koi -- or on any day the file goes
// missing -- the URL 404s, and a heading over an empty space reads as broken,
// so the section steps aside instead.
const failed = ref(false)
</script>
