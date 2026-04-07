/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. TAMBAHKAN BARIS INI
  darkMode: 'class', 
  
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}