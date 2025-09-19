// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line is the most important
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}