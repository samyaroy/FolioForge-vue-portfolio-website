# Design System — FolioForge

This document captures the UI/UX language of the FolioForge portfolio site so that a
new page or component can be built to look and feel like the rest of the site. It is
descriptive of what already exists in the codebase, not aspirational. When the code and
this document disagree, the code wins — update this file to match.

Pair this with [CONTEXT.md](CONTEXT.md), which covers architecture, routing, content
model, and feature flags. This file is purely about visual design and interaction.

## Design Principles

- **Clean, academic, professional.** White and light-slate surfaces, a single confident
  blue accent, generous whitespace, and restrained typography. No heavy gradients or
  loud color outside of brand badges.
- **Content first.** Layouts are centered, capped in width, and readable. Long-form text
  is justified (`content-justify`).
- **Calm motion.** Hover and state changes are quick (`200ms`) color/translate/shadow
  transitions. Nothing bounces or spins except small "live" accent dots.
- **Card-based composition.** Most content is grouped into rounded white cards on a
  slate-50 page, with soft shadows that deepen slightly on hover.
- **Utility-first styling.** Tailwind utility classes carry the design. Vuetify supplies
  interactive primitives (icons, buttons, rows/cols, footer, dividers). Reach for scoped
  `<style>` only for effects Tailwind can't express inline (keyframes, pseudo-elements).

## Tech & Tooling Constraints

- **Vue 3** SFCs with `<script setup>` for new components (older ones use the Options API;
  prefer `<script setup>` going forward).
- **Tailwind CSS 3** for layout, color, spacing, typography. Custom tokens are in
  [tailwind.config.js](tailwind.config.js).
- **Vuetify 3** for `v-icon`, `v-btn`, `v-row`/`v-col`, `v-footer`, `v-divider`, dialogs.
  All components/directives are globally registered.
- **Icons:** Material Design Icons via `mdi-*` strings inside `<v-icon>` (e.g.
  `<v-icon size="18">mdi-email</v-icon>`). Brand icons not in MDI use Font Awesome
  (`font-awesome-icon`) or inline SVG. Kaggle uses inline SVG.
- Plain `<button>` and `<a>` elements are used freely with Tailwind classes; you do not
  have to use `v-btn` for everything.

## Color Tokens

Custom Tailwind colors (from [tailwind.config.js](tailwind.config.js)):

| Token | Hex | Usage |
| --- | --- | --- |
| `primary` (DEFAULT) | `#1980e6` | Brand blue: links, active nav, primary buttons, icons, accents |
| `primary.700` | `#0d47a1` | Deep blue for primary hover/pressed |
| `base_black` (DEFAULT) | `#0e141b` | Primary text / near-black ink |
| `base_black.700` | `#1565c0` | Secondary blue (button hover in hero) |
| `secondary` | `#0e141b` | Same near-black as `base_black` |
| `accent` | `#10b981` | Emerald accent (sparingly) |

Frequently used stock Tailwind colors (treat these as part of the palette):

- **Page background:** `bg-slate-50` (`#f8fafc`).
- **Card / surface:** `bg-white`; subtle inner cards use `bg-slate-50`.
- **Primary text:** `text-[#0e141b]` / `text-base_black`.
- **Muted/secondary text:** `text-slate-500`, `text-slate-600`, `text-gray-600`.
- **Faint/meta text:** `text-slate-400`, `text-gray-500`.
- **Hairline borders:** header uses `#e7edf3`; elsewhere `border-slate-200` / `border-slate-300`.
- **Primary blue, raw:** `#1980e6` (and `#1565c0` for a darker hover step).
- **Footer surface:** `bg-blue-800` with mostly black text on it.
- **Tag chips:** `bg-blue-100/50` with `text-slate-600`.
- **Selected option highlight:** `bg-sky-50` + `border-primary` + `text-primary`.
- **Overlay scrim:** `bg-slate-950/80` (image zoom), `bg-black bg-opacity-50` (mobile drawer).
- **Star/featured:** `text-yellow-500`; **sparkle accent:** `#facc15`.

Rule of thumb: **one accent (blue) does the work.** Reserve other hues for platform brand
badges (LinkedIn `#0a66c2`, YouTube `#ff0000`, Instagram gradient, Zoom `#0b5cff`, Twitter
`#0f172a`) and the occasional yellow "live"/featured cue.

## Typography

- **Font family:** `system-ui, Avenir, Helvetica, Arial, sans-serif` (set on `:root` in
  [src/style.css](src/style.css)). No web font is loaded; stay system-native.
- **Serif accent:** card titles in the gallery use `font-serif` for an editorial feel.
  Use it deliberately for titles, not body copy.
- **Antialiasing/legibility** are globally enabled; don't fight them.

Scale and weight conventions seen across pages:

| Role | Classes |
| --- | --- |
| Hero `h1` | `text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]` (often `!text-4xl` to override global `h1`) |
| Page title `h1` | `text-4xl font-black text-[#0e141b] tracking-[-0.033em]` |
| Section title `h2` | `text-[32px] font-bold leading-tight` (or `text-2xl`/`text-4xl font-bold`) |
| Card title | `text-sm font-bold` (small cards) up to `text-[1.25rem] font-semibold tracking-[-0.02em]` (feature cards) |
| Hero subtitle / lede | `text-sm md:text-base font-normal` or `text-lg text-gray-600`, justified |
| Body / caption | `text-[0.90rem] leading-7 text-slate-500` |
| Nav link | `text-sm font-medium` |
| Eyebrow / label | `text-xs font-bold uppercase tracking-[0.16em]–tracking-[0.22em] text-slate-400` |
| Tag chip text | `text-[10px] font-semibold uppercase tracking-[0.10em]` |

Notes:
- **Tight tracking on big headings** (`tracking-[-0.033em]`, `-0.02em`); **wide tracking
  on small uppercase labels** (`0.1em`–`0.22em`).
- `font-black` for the largest display headings, `font-bold` for section titles,
  `font-semibold`/`font-medium` for supporting text.
- Global `h1` is `3.2em`; page-level hero/title headings override it with explicit
  `text-4xl`/`!text-4xl` so the Tailwind scale governs.

## Layout & Spacing

### Page shell

Every routed page renders inside the app shell from [src/App.vue](src/App.vue):
`v-app` → `<Header>` → `<main class="flex-1">` (router-view) → `<Footer>`, all inside a
`flex flex-col min-h-screen` wrapper. New pages only author the `<main>` content.

Standard page wrapper (pick one, both are in use):

```html
<!-- Full-bleed page on slate background -->
<div class="min-h-screen bg-slate-50">
  <div class="container mx-auto px-4 py-8">
    ...
  </div>
</div>
```

```html
<!-- Section band with responsive side padding -->
<div class="px-4 md:px-8 lg:px-20 py-4 bg-white">
  <div class="max-w-[1200px] mx-auto">
    ...
  </div>
</div>
```

### Width caps & containers

- `container mx-auto px-4` — default centered container.
- `max-w-[1200px] mx-auto` — home/section content cap.
- `max-w-6xl mx-auto` — tab content / reading width.
- `max-w-4xl mx-auto` — narrow intro paragraphs.

### Responsive padding ramp

Horizontal padding grows with breakpoint: `px-4 md:px-8 lg:px-20`. Vertical section
padding is typically `py-4` to `py-10`. Hero/grids use `gap-6 md:gap-8`.

### Breakpoints

Tailwind defaults. `md` (768px) is the primary desktop/mobile switch (desktop nav vs.
hamburger; single-column vs. multi-column). `lg` adds the third tier (e.g. hero goes
`flex-col` → `lg:flex-row`, research cards `cols=6 md=4 lg=3`).

### Grids

- Vuetify `v-row`/`v-col` for fluid card grids (e.g. research interests
  `cols="6" md="4" lg="3"`).
- The footer uses a custom 20-column grid (`md:grid-cols-20`, from
  [tailwind.config.js](tailwind.config.js)) split `9 / 7 / 4`.
- Gallery uses a CSS/Tailwind card grid with a "load more" pattern (6 at a time).

## Iconography

- Use `<v-icon>` with MDI names. Common sizes: `14`, `16`, `18`, `20`, `22`, `24`.
- Inline icon + label pattern: `class="flex items-center gap-2"` with the icon first.
- Color icons with text utilities (`text-[#1980e6]`, `text-slate-600`) or the `color`
  prop on `v-btn`/`v-icon`.
- Map domain concepts to icons explicitly (see the `iconMap` in
  [researchInterests/index.vue](src/views/Home/components/researchInterests/index.vue) for
  the established convention) and fall back to `mdi-help-circle-outline`.

## Component Recipes

These are the reusable building blocks. Copy the class strings to stay on-system.

### Section header

```html
<div class="flex flex-wrap justify-between gap-3 p-4">
  <h2 class="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">
    Section Title
  </h2>
</div>
```

Centered page header variant (used on tabbed pages):

```html
<div class="text-center mb-12">
  <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">Page Title</h1>
  <p class="content-justify text-lg text-gray-600 max-w-4xl mx-auto">
    One-sentence description of the page.
  </p>
</div>
```

### Buttons

Primary (filled blue):

```html
<button class="flex flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden
               rounded-lg h-10 px-3 md:h-12 md:px-4 bg-[#1980e6] text-slate-50 text-sm
               font-bold leading-normal tracking-[0.015em] hover:bg-[#1565c0]
               transition-colors duration-200">
  <v-icon size="18">mdi-folder-network</v-icon>
  <span class="truncate">Label</span>
</button>
```

Secondary (white, black outline, fills blue on hover):

```html
<button class="flex flex-1 ... rounded-lg h-10 px-3 md:h-12 md:px-4 bg-white text-[#000000]
               text-sm font-bold tracking-[0.015em] border-2 border-black
               hover:bg-[#1980e6] hover:text-white transition-all duration-200">
  <v-icon size="18">mdi-door</v-icon>
  <span class="truncate px-1">Label</span>
</button>
```

Outline-on-dark (black fill, blue border):

```html
<button class="flex flex-1 ... rounded-lg h-10 px-3 md:h-12 md:px-4 bg-black border-2
               border-[#1980e6] text-white text-sm font-bold tracking-[0.015em]
               hover:bg-[#1980e6] hover:text-white transition-all duration-200">
  <v-icon size="18">mdi-tray-arrow-down</v-icon>
  <span class="truncate px-1">Label</span>
</button>
```

Conventions: `rounded-lg`, `h-10 md:h-12`, `text-sm font-bold`, icon-left + truncating
label, `transition-colors`/`transition-all duration-200`. Buttons in a row use
`flex flex-1` to share width equally.

### Cards

Simple stat/label card (research interest):

```html
<div class="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 h-full">
  <div class="flex flex-col items-center justify-center text-center h-full">
    <v-icon class="text-[#1980e6] mb-2" size="20">mdi-brain</v-icon>
    <h3 class="text-[#0e141b] text-sm font-bold leading-tight">Title</h3>
  </div>
</div>
```

Rich content card (gallery), the premium card pattern:

```html
<article class="group relative flex h-full flex-col overflow-hidden rounded-[12px]
                bg-white shadow-[0_12px_32px_-4px_rgba(14,20,27,0.08)] ring-1
                ring-slate-900/5 transition-all duration-300 hover:-translate-y-1
                hover:shadow-[0_18px_42px_-10px_rgba(14,20,27,0.14)]">
  ...
</article>
```

Card conventions:
- Radius: `rounded-lg` (8px) for simple cards, `rounded-[12px]` for feature cards.
- Shadow: soft, low-opacity custom shadows; lift on hover via `hover:-translate-y-1` and a
  deeper shadow, or `hover:shadow-md` for simple cards.
- Hairline ring: `ring-1 ring-slate-900/5` for definition on white.
- Featured/active state: tint the ring/shadow toward primary
  (`ring-primary/20 shadow-[...rgba(24,128,230,0.2)]`).
- Always `h-full` when inside a grid so cards in a row match height.
- Inner padding: `p-4` (compact) to `p-6` (content cards).

### Tag / pill chips

```html
<li class="rounded-[5px] bg-blue-100/50 px-1.5 py-1 text-[10px] font-semibold uppercase
           tracking-[0.10em] text-slate-600">
  tag
</li>
```

### Tab switcher (pill group)

```html
<div class="flex justify-center mb-8">
  <div class="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
    <button :class="[
        'px-6 py-3 rounded-md text-sm font-medium transition-all duration-200',
        active === id
          ? 'bg-[#1980e6] text-white shadow-sm'
          : 'text-gray-600 hover:text-[#1980e6] hover:bg-gray-50']">
      Tab Name
    </button>
  </div>
</div>
```

Drive tabs off feature flags: build the tab list from enabled flags, default to the first
enabled tab, and optionally honor a `?tab=` query param (see
[ProjectsPublications/index.vue](src/views/ProjectsPublications/index.vue)).

### Navigation links

Header links use a scoped recipe:

```css
.nav-link { @apply text-base_black text-sm font-medium transition-colors duration-200 no-underline; }
.nav-link:hover { @apply text-primary; }
.active-link { @apply font-bold text-primary; }
```

Apply with `<router-link class="nav-link" active-class="active-link">`.

### Glass / floating control (filter button & popover)

Frosted, translucent, blurred controls float above content:

```html
<button class="inline-flex h-10 w-8 items-center justify-center rounded-full border
               border-white/60 bg-white/50 text-slate-600 shadow-lg backdrop-blur-md
               transition-all duration-200 hover:border-primary/60 hover:bg-white/70
               hover:text-primary focus-visible:outline-none focus-visible:ring-2
               focus-visible:ring-primary/30">
  <v-icon size="16">mdi-filter-variant</v-icon>
</button>
```

Popover panel: `rounded-[12px] border border-white/70 bg-white/85 p-4 shadow-xl
backdrop-blur-md`. A count badge floats at `-right-1 -top-1` as a `rounded-full bg-primary
text-white text-[10px] font-bold` pill. Checkbox options use `accent-primary` and a
selected state of `border-primary bg-sky-50 text-primary`.

### Modal / overlay (image zoom)

Use `<Teleport to="body">` + a `<Transition>` fade. Scrim is `fixed inset-0 z-50 flex
items-center justify-center bg-slate-950/80`; close on `@click.self`, on `Escape`, and lock
`document.body.style.overflow = 'hidden'` while open. Controls are circular translucent
buttons (`bg-white/10 hover:bg-white/20 text-white`, focus ring `ring-white/70`). See
[GalleryCard.vue](src/views/Gallery/components/GalleryCard.vue) for the full pattern incl.
prev/next and slide dots.

### Mobile drawer

Right-side sheet over a scrim:

```html
<div class="fixed inset-0 z-50 md:hidden" @click.self="drawer = false">
  <div class="absolute inset-0 bg-black bg-opacity-50"></div>
  <div class="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">...</div>
</div>
```

Toggle is a hamburger (`mdi-menu`) shown only below `md`. Each link closes the drawer
on click (`@click="drawer = false"`).

## Header & Footer (fixed chrome)

- **Header** ([Header.vue](src/components/Header.vue)): `sticky top-0 z-50 bg-white`, bottom
  hairline `border-b border-[#e7edf3]`, `px-10 py-4`. Left: round profile icon (`size-4`,
  `rounded-full object-cover`) + bold name brand link. Right: desktop nav (`hidden md:flex
  gap-9`) and a `md:hidden` hamburger. Nav items are conditional on feature flags +
  `router.hasRoute(...)`.
- **Footer** ([Footer/index.vue](src/components/Footer/index.vue)): a `3px` rounded divider
  bar, then `v-footer` with `bg-blue-800` on a 20-col grid (`9/7/4`): brand + socials +
  institution logos, "Other Links" + "Social Links", and "Contact Info". A bottom strip
  shows copyright, source-code attribution, and `Last updated: {{ last_updated_on }}`.
  Footer links are also feature-flagged.

## Motion & Interaction

- **Transitions:** `transition-colors`/`transition-all`/`transition-shadow` with
  `duration-200` (controls) or `duration-300`–`duration-500` (cards/images). Hover image
  zoom: `group-hover:scale-[1.02]`, `duration-500`.
- **Hover affordances:** color shift to primary, `hover:shadow-md` /
  `hover:-translate-y-1`, background fill flips on outline buttons.
- **Focus:** keyboard focus is visible — `focus:outline-none focus:ring-2
  focus:ring-primary` (or `ring-white/70` on dark). Keep it; don't strip focus rings.
- **Live cues:** small blinking accent dots via CSS keyframes + blurred pseudo-element
  glow (see the Blog dot and Resources sparkle). Use sparingly to flag "new".
- **Accessibility:** provide `aria-label`/`aria-expanded`/`aria-modal`/`role` on
  interactive non-semantic elements, `alt` on images (with a fallback asset), and
  `loading="lazy"` on content images. Always offer an Escape/`@click.self` close on overlays.

## Content & Copy Conventions

- Long descriptive paragraphs use the `content-justify` helper (justified text).
- Section/page intros are a single concise sentence under the title.
- Dates are formatted with `Intl.DateTimeFormat('en', { month:'short', day:'numeric',
  year:'numeric' })` → e.g. `Jun 21, 2026`.
- Labels and eyebrows are UPPERCASE with wide tracking; titles are sentence/title case.
- Truncate constrained text with `truncate` + `min-w-0` rather than letting it wrap.

## Checklist for a New Page

1. Wrap in `min-h-screen bg-slate-50` and a centered container
   (`container mx-auto px-4 py-8` or `max-w-[1200px] mx-auto`).
2. Lead with a section/page header using the heading scale above.
3. Compose content from the card / chip / button / tab recipes — don't invent new shadows,
   radii, or accent colors; reuse `#1980e6` and the slate/white surfaces.
4. Use `<v-icon>` MDI icons at the standard sizes; map concepts to icons explicitly.
5. Make it responsive at `md` (and `lg` for 3-tier grids); ramp side padding
   `px-4 md:px-8 lg:px-20`.
6. Add `200ms` color/shadow hover transitions and visible focus rings.
7. If the page is optional, gate it behind a feature flag and wire router meta +
   header/footer links (see [CONTEXT.md](CONTEXT.md)).
8. Add the route to the sitemap `publicRoutes` in [vite.config.js](vite.config.js) if it
   should be indexed.
