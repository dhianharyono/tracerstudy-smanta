/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f2f6fc',
          100: '#e4edf9',
          200: '#c4dcf2',
          300: '#98c4eb',
          400: '#64a4df',
          500: '#4688cd',
          600: '#3b6ebb',
          650: '#315fa4',
          700: '#2b4e8c',
          800: '#274272',
          900: '#22385b',
          950: '#142137',
        },
        indigo: {
          50: '#f4f6fc',
          100: '#e7ecf9',
          200: '#ccd6f3',
          300: '#a5b7e8',
          400: '#7792db',
          500: '#5f7acb',
          600: '#5c6bb2',
          650: '#4d5999',
          700: '#45518b',
          800: '#3b4474',
          900: '#32385e',
          950: '#1e223b',
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
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(20px)' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        fadeOut: 'fadeOut 0.5s ease-out forwards',
        'spin-reverse': 'spinReverse 1s linear infinite',
      },
    },
  },
  plugins: [],
};
