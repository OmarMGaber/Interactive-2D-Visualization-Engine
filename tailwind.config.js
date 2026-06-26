/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 👈 THIS is what Tailwind reads
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};