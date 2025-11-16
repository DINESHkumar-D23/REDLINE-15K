/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6b35',
          dark: '#e55a2b',
        },
        dark: {
          bg: '#0a0e1a',
          card: '#111827',
          border: '#1f2937',
        },
      },
    },
  },
  plugins: [],
}

