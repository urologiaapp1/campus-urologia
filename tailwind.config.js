/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Petróleo clínico — escala completa
        brand: {
          50:  '#eef6f8',
          100: '#d4eaee',
          200: '#a9d4db',
          300: '#73b8c3',
          400: '#3d9dab',
          500: '#0e7490',
          600: '#0c617a',
          700: '#0a5068',
          800: '#083f52',
          900: '#052d3b',
        },
        // Semánticos
        success: { DEFAULT: '#16a34a', light: '#f0fdf4', dark: '#14532d' },
        warning: { DEFAULT: '#d97706', light: '#fffbeb', dark: '#78350f' },
        danger:  { DEFAULT: '#dc2626', light: '#fef2f2', dark: '#7f1d1d' },
        info:    { DEFAULT: '#2563eb', light: '#eff6ff', dark: '#1e3a8a' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'elev-1': '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
        'elev-2': '0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.05)',
        'elev-3': '0 10px 30px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06)',
      },
      borderRadius: {
        DEFAULT: '8px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      animation: {
        'fade-up':   'fadeUp .35s ease-out',
        'fade-in':   'fadeIn .2s ease-out',
        'slide-in':  'slideIn .3s ease-out',
        'skeleton':  'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity:'0', transform:'translateY(10px)' }, to: { opacity:'1', transform:'none' } },
        fadeIn:   { from: { opacity:'0' }, to: { opacity:'1' } },
        slideIn:  { from: { opacity:'0', transform:'translateX(-8px)' }, to: { opacity:'1', transform:'none' } },
        skeleton: { '0%,100%': { opacity:'.4' }, '50%': { opacity:'1' } },
      },
    },
  },
  plugins: [],
};
