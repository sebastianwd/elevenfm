/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

delete colors['lightBlue']
delete colors['warmGray']
delete colors['trueGray']
delete colors['coolGray']
delete colors['blueGray']

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        waves: {
          '0%, 100%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1)' },
        },
      },
      animation: {
        waves: 'waves 1s linear infinite',
      },
      colors: {
        primary: {
          500: '#FC3967',
        },
        dark: {
          300: '#CBCCCC',
          400: '#AAAAAA',
          500: '#202020',
          600: '#121212',
          700: '#110F10',
          800: '#0E0C0D',
          900: '#0C0C0C',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'animation-delay': (value) => {
            return {
              'animation-delay': value,
            }
          },
        },
        {
          values: theme('transitionDelay'),
        }
      )
    }),
  ],
}
