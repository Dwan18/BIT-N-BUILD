/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#090d12',
          900: '#10161d',
          850: '#151d26',
          800: '#1b2530',
          700: '#2a3744',
          600: '#3b4b5a',
          500: '#536575',
        },
        signal: {
          300: '#b5fff2',
          400: '#6ee7d8',
          500: '#2dd4bf',
          600: '#14b8a6',
        },
        live: '#fb7185',
        amber: { DEFAULT: '#fbbf24' },
        ok: '#4ade80',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 12px 32px -18px rgba(0,0,0,0.7)',
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
