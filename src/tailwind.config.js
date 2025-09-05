/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",   // Scan all React files
    "./public/index.html"           // Also scan index.html
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
