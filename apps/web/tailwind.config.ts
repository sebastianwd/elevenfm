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
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        ripple: {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) scale(1)',
          },
          '50%': {
            transform: 'translate(-50%, -50%) scale(0.9)',
          },
        },
        'shine-pulse': {
          '0%': {
            'background-position': '0% 0%',
          },
          '50%': {
            'background-position': '100% 100%',
          },
          to: {
            'background-position': '0% 0%',
          },
        },
      },
      animation: {
        waves: 'waves 1s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        ripple: 'ripple var(--duration,2s) ease calc(var(--i, 0)*.2s) infinite',
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
