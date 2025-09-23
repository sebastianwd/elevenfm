import pino from 'pino'
import { inspect } from 'util'

export const logger = pino(
  process.env.NODE_ENV === 'production'
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      }
)
