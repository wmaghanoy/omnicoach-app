/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0a0a',
          900: '#0f0f0f',
          850: '#1a1a1a',
          800: '#1f1f1f',
          750: '#2a2a2a',
          700: '#2f2f2f',
        },
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        purple: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}