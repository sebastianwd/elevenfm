import { ORPCError, os } from '@orpc/server'

import type { Context } from '../context'

export const authMiddleware = os.$context<Context>().middleware(async ({ context, next }) => {
  if (!context.session.user) {
    throw new ORPCError('UNAUTHORIZED')
  }
  return next({
    context: {
      session: context.session
    }
  })
})
