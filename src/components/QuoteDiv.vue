<template>
  <section v-if="quote" class="quote-div" aria-label="Page quote">
    <div class="quote-div__inner">
      <span class="quote-div__mark" aria-hidden="true">“</span>
      <blockquote class="quote-div__quote">
        <p>{{ quote.text }}</p>
        <footer v-if="quote.author || quote.source">
          <span v-if="quote.author" class="quote-div__author">{{ quote.author }}</span>
          <cite v-if="quote.source" class="quote-div__source">{{ quote.source }}</cite>
        </footer>
      </blockquote>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import config from '@/content/profile_info'

const route = useRoute()

const quote = computed(() => {
  const pageQuotes = config.page_quotes || {}
  const routeName = typeof route.name === 'string' ? route.name : 'default'
  const quotes = pageQuotes[routeName] || pageQuotes.default || []

  if (!Array.isArray(quotes) || quotes.length === 0) return null

  const today = new Date()
  const dayKey = Math.floor(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) /
      86_400_000,
  )

  return quotes[dayKey % quotes.length]
})
</script>

<style scoped>
.quote-div {
  padding: 2rem 1rem 2.25rem;
  background: #f8fafc;
}

.quote-div__inner {
  position: relative;
  max-width: 82rem;
  margin: 0 auto;
  padding: 1.35rem 1.5rem 1.35rem 4.75rem;
  overflow: hidden;
  border: 1px solid rgba(78, 115, 151, 0.18);
  border-left: 5px solid #4e7397;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.quote-div__mark {
  position: absolute;
  top: 0.1rem;
  left: 1.2rem;
  color: rgba(78, 115, 151, 0.2);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 5rem;
  line-height: 1;
}

.quote-div__quote {
  margin: 0;
}

.quote-div__quote p {
  margin: 0;
  color: #0f172a;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(0.9rem, 1.15vw, 1.05rem);
  font-style: italic;
  line-height: 1.55;
}

.quote-div__quote footer {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: 0.65rem;
  color: #4e7397;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.quote-div__source {
  color: rgba(78, 115, 151, 0.7);
  font-style: italic;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: none;
}

.quote-div__source::before {
  content: "— ";
}

@media (max-width: 640px) {
  .quote-div {
    padding: 1.5rem 0.75rem 1.75rem;
  }

  .quote-div__inner {
    padding: 1.2rem 1rem 1.2rem 3.25rem;
  }

  .quote-div__mark {
    left: 0.8rem;
    font-size: 3.8rem;
  }
}
</style>
