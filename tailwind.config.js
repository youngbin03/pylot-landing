/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.jsx"
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#000000',
        'bright-blue': '#4A69FF',
        'light-gray': '#F7F7F7'
      },
      fontFamily: {
        'pretendard': ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif']
      }
    },
  },
  plugins: [],
}