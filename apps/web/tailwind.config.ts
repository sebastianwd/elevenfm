import containerQueries from '@tailwindcss/container-queries'
import typography from '@tailwindcss/typography'
import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import twAnimate from 'tailwindcss-animate'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  prefix: '',
  theme: {
    extend: {
      keyframes: {
        waves: {
          '0%, 100%': { transform: 'scale(0)', opacity: '1' },
          '50%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-size': {
          '0%, 100%': {
            height: '4px',
            transform: 'translateY(11px)',
          },
          '50%': {
            height: '26px',
            transform: 'translateY(0px)',
          },
        },
      },
      animation: {
        waves: 'waves 1s linear infinite',
        'pulse-size': 'pulse-size 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        primary: {
          500: '#FC3967',
        },
        surface: {
          50: '#A3A3A3',
          100: '#999999',
          200: '#8A8A8A',
          300: '#7A7A7A',
          400: '#696969',
          500: '#474747',
          600: '#383838',
          700: '#292929',
          800: '#202020',
          900: '#0F0F0F',
          950: '#0A0A0A',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    typography,
    containerQueries,
    twAnimate,
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
} satisfies Config
