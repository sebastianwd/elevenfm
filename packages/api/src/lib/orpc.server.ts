import { os } from '@orpc/server'

import type { Context } from '../context'
import { authMiddleware } from '../middleware/auth'

export const o = os.$context<Context>()

export const publicProcedure = o

export const protectedProcedure = publicProcedure.use(authMiddleware)
