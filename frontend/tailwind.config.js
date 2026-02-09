
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9f5',
          100: '#e1f2e8',
          200: '#c3e3d2',
          300: '#96cbb2',
          400: '#64ac8d',
          500: '#429172', // Primary Green
          600: '#31755b',
          700: '#285e4a',
          800: '#234b3c',
          900: '#1d3e32',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
