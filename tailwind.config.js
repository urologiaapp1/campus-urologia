/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef7f6',
          100: '#d5ecea',
          200: '#aad9d6',
          300: '#74c2be',
          400: '#3da8a3',
          500: '#0e7490',
          600: '#0c647c',
          700: '#0a5468',
          800: '#084455',
          900: '#073846',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
