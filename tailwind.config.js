/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#f5f8ff',
          100: '#ebf1ff',
          200: '#dce6ff',
          300: '#c2d3ff',
          400: '#9db5ff',
          500: '#7a94ff',
          600: '#5d75f3',
          700: '#4d62db',
          800: '#4152b3',
          900: '#394791',
          950: '#252d54',
        },
        'accent': {
          50: '#f6f8ff',
          100: '#ecf1ff',
          200: '#dfe6ff',
          300: '#c5d4ff',
          400: '#a0b7ff',
          500: '#8096ff',
          600: '#6477f0',
          700: '#5463d8',
          800: '#4553b0',
          900: '#3b478f',
          950: '#262d52',
        },
        'concrete': {
          50: '#f7f9ff',
          100: '#eef2ff',
          200: '#e2e8ff',
          300: '#ccd6ff',
          400: '#a8b9ff',
          500: '#8698ff',
          600: '#6a79ed',
          700: '#5a66d5',
          800: '#4b55ad',
          900: '#3f478c',
          950: '#282d50',
        }
      },
      backgroundImage: {
        'gradient-custom': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      },
      gradientColorStops: {
        'from-custom': '#4d62db',
        'to-custom': '#394791',
      },
    },
  },
  plugins: [],
};