/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-blue-200',
    'text-blue-800',
    'bg-green-200',
    'text-green-800',
    'bg-yellow-200',
    'text-yellow-800',
    'bg-red-200',
    'text-red-800',
    'bg-gray-200',
    'text-gray-800',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
