/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        20: 'repeat(20, minmax(0, 1fr))',
      },
      colors: {
        base_black: {
          DEFAULT: '#0e141b',
          700: '#1565c0',
        },
        primary: {
          DEFAULT: '#1980e6',
          700: '#0d47a1',
        },
        secondary: '#0e141b',
        accent: '#10b981',
      },
    },
  },
  plugins: [],
}