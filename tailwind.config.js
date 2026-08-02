/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        20: 'repeat(20, minmax(0, 1fr))',
      },
      // The site's own palette. shadcn-vue's init replaced primary/secondary/
      // accent with hsl(var(--*)) from its neutral theme, which recoloured the
      // ~15 existing text-primary/bg-primary/border-primary usages. The brand
      // values are authoritative here; `foreground` is kept so shadcn-vue
      // components that pair bg-primary with text-primary-foreground still work.
      colors: {
        base_black: {
          DEFAULT: '#0e141b',
          700: '#1565c0',
        },
        primary: {
          DEFAULT: '#1980e6',
          700: '#0d47a1',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: '#0e141b',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: '#10b981',
          foreground: 'hsl(var(--accent-foreground))',
        },

        // shadcn-vue's remaining tokens: none of these names existed before, so
        // they add capability without changing any current utility.
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      // No borderRadius override: the init remapped lg/md/sm to var(--radius),
      // which resized every rounded-md (18 uses) and rounded-sm (2) in the app.
      // shadcn-vue components fall back to Tailwind's defaults, which match.
    },
  },
  plugins: [require("tailwindcss-animate")],
}
