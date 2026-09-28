/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fond lavande de l'application
        lavender: { DEFAULT: '#E9EBFB', soft: '#F3F4FD', deep: '#DADDF7' },
        // Indigo : sidebar, boutons, séries principales
        indigo: {
          900: '#3A3CA0',
          800: '#4F52C6', // sidebar / boutons
          600: '#6C6FE0',
          400: '#8E91EE',
          200: '#B5B7F5',
          100: '#DCDDFA',
          50: '#EFEFFD',
        },
        // Orange corail : séries secondaires, alertes douces
        coral: {
          600: '#F58B5C',
          400: '#F9B08F',
          200: '#FCD4C0',
          50: '#FEF1EA',
        },
        ink: { DEFAULT: '#2B2D42', soft: '#5C5F7A', muted: '#9A9CB5', line: '#ECEDF7' },
      },
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        shell: '32px',
      },
      boxShadow: {
        card: '0 6px 24px -8px rgba(79, 82, 198, 0.12), 0 2px 6px -2px rgba(79, 82, 198, 0.06)',
        'card-hover': '0 14px 34px -10px rgba(79, 82, 198, 0.22), 0 4px 10px -4px rgba(79, 82, 198, 0.08)',
        pill: '0 4px 14px -4px rgba(79, 82, 198, 0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
