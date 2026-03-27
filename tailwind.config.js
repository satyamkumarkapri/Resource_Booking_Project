/** @type {import('tailwindcss').Config} */
export default {
  // This tells Tailwind to look for the .dark class on the <html> tag
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}