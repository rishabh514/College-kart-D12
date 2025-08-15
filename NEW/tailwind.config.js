/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can keep this empty because the core theme variables 
      // are being imported directly into index.css from the original file.
    },
  },
  plugins: [],
}