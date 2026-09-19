/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#040b18',
          900: '#071224',
          850: '#0a1730',
          800: '#0d1b33',
          700: '#132850',
          600: '#1c3563',
          500: '#2a4a82',
        },
        signal: {
          300: '#9cc8ff',
          400: '#6db0ff',
          500: '#4d9bff',
          600: '#2f7ff0',
        },
        live: '#ff5c6c',
        amber: { DEFAULT: '#f5b84b' },
        ok: '#34d399',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(109,176,255,0.06) inset, 0 12px 32px -18px rgba(0,0,0,0.7)',
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
