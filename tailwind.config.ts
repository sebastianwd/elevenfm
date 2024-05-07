import containerQueries from '@tailwindcss/container-queries'
import typography from '@tailwindcss/typography'
import plugin from 'tailwindcss/plugin'

/*type TailwindShade<T extends readonly number[], S extends string> = {
  [key in T[number]]: `var(--${S}-${key}) / <alpha-value>`
}

const twLevels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

const getShades = <T extends string>(color: T) => {
  return twLevels.reduce(
    (acc, level) => {
      Object.assign(acc, {
        [level]: `rbg(var(--${color}-${level}) / <alpha-value>)`,
      })
      return acc
    },
    {} as TailwindShade<typeof twLevels, typeof color>
  )
}*/

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        waves: {
          '0%, 100%': { transform: 'scale(0)', opacity: 1 },
          '50%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      animation: {
        waves: 'waves 1s linear infinite',
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
