/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // БЕЗ ЭТОЙ СТРОКИ ТЕМА НЕ ЗАРАБОТАЕТ
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}