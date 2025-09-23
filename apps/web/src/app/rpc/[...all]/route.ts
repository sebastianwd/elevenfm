import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { createContext } from '@repo/api/context'
import { router } from '@repo/api/routers/index'
import type { NextRequest } from 'next/server'

const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error: unknown) => {
      console.error(error)
    }),
  ],
})

async function handleRequest(req: NextRequest) {
  const rpcResult = await rpcHandler.handle(req, {
    prefix: '/rpc',
    context: await createContext(req),
  })
  if (rpcResult.response) return rpcResult.response

  return new Response('Not found', { status: 404 })
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
