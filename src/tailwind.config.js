/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",   // all React files
    "./public/index.html"           // safety: also scan index.html
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
