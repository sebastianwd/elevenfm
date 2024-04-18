import pino from 'pino'
import { MiddlewareFn } from 'type-graphql'

import { Context } from '~/types'

const logger = pino(
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

export const ErrorInterceptor: MiddlewareFn<Context> = async (_, next) => {
  try {
    return await next()
  } catch (err) {
    logger.error({ err })

    throw err
  }
}
