import { MiddlewareFn } from 'type-graphql'

import { Context } from '~/types'

import { logger } from '../logger'

export const ErrorInterceptor: MiddlewareFn<Context> = async (_, next) => {
  try {
    return await next()
  } catch (err) {
    logger.error({ err })

    throw err
  }
}
