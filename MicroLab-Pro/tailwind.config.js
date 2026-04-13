/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', hover: '#1D4ED8' },
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        dark: '#0F172A',
      }
    },
  },
  plugins: [],
}