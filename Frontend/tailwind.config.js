/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#fffaf3',
          900: '#fff7ed',
          850: '#fffdf8',
          800: '#ffffff',
          700: '#f5eadf',
          600: '#e2d3c4',
          500: '#cbb8a6',
        },
        signal: {
          300: '#ffd3a6',
          400: '#ffad70',
          500: '#f47721',
          600: '#dc5b0b',
        },
        live: '#e5484d',
        amber: { DEFAULT: '#c87900' },
        ok: '#0b9b7a',
        slate: {
          50: '#182235',
          100: '#25334a',
          200: '#34445c',
          300: '#4b5d75',
          400: '#667890',
          500: '#8492a4',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.9) inset, 0 14px 34px -22px rgba(100,70,40,0.28)',
      },
      keyframes: {
        'live-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        'toast-in': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'live-ring': 'live-ring 1.6s ease-out infinite',
        'toast-in': 'toast-in 180ms ease-out',
      },
    },
  },
  plugins: [],
};
