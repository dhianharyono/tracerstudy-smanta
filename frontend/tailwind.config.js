/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f6fe',
          100: '#e0edfe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#38bdf8',
          500: '#2563eb',
          600: '#1d4ed8',
          650: '#1e40af',
          700: '#1d3a8a',
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        },
        indigo: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          650: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3c1874',
          950: '#260b4e',
        },
        slate: {
          650: '#404e63',
        },
        red: {
          650: '#b91c1c',
        },
        green: {
          650: '#15803d',
        }
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(37, 99, 235, 0.25)',
        'glow-md': '0 0 20px rgba(37, 99, 235, 0.35)',
        'glow-lg': '0 0 30px rgba(37, 99, 235, 0.45)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(12px)' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeOut: 'fadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin-reverse': 'spinReverse 1s linear infinite',
        shimmer: 'shimmer 2s infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

