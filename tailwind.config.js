/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base_black: {
          DEFAULT: '#0e141b',
          700: '#1565c0',
        },
        primary: {
          DEFAULT:'#1980e6',
          700: '#0d47a1',
        }, // hover / accent color
        secondary: '#0e141b', // default text color
        accent: '#10b981', // example additional color
      },
    },
  },
  plugins: [],
}