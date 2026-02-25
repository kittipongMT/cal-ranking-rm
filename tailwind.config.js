/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        kanit: ['"Kanit"', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#dfcd80',
          muted: 'rgba(223,205,128,0.22)',
          bg: 'rgba(223,205,128,0.10)',
          border: 'rgba(223,205,128,0.55)',
          dark: 'rgba(223,205,128,0.12)',
        },
      },
    },
  },
  plugins: [],
}
