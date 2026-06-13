/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7f6',
          100: '#d5ecea',
          500: '#0e7490',
          600: '#0c647c',
          700: '#0a5468',
          900: '#073846',
        },
      },
    },
  },
  plugins: [],
};
