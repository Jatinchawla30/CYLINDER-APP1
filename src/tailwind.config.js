/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",   // ✅ All React files
    "./public/index.html"           // ✅ Also scan index.html (safety)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
