/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lab: {
          primary: '#2563EB', // Blue 600
          dark: '#1e293b',    // Slate 800
          accent: '#10B981',  // Emerald 500
          danger: '#EF4444',  // Red 500
        }
      }
    },
  },
  plugins: [],
}