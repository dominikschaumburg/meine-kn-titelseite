/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'kn-blue': '#4F80FF',
        'kn-green': '#6bb024',
        'kn-red': '#e84f1c',
        'kn-light': '#eef3f5',
        'kn-dark': '#2a3845',
      },
      fontFamily: {
        'din': ['DINNext', 'sans-serif'],
      },
    },
  },
  plugins: [],
}