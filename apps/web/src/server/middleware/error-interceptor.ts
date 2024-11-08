/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { MiddlewareFn } from 'type-graphql'

import type { Context } from '~/types'

import { logger } from '../logger'

export const ErrorInterceptor: MiddlewareFn<Context> = async (_, next) => {
  try {
    return await next()
  } catch (err) {
    logger.error({ err })

    throw err
  }
}
