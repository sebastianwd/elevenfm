import { RPCHandler } from '@orpc/server/fetch'
import { onError } from '@orpc/server'
import { NextRequest } from 'next/server'
import { router } from '@repo/api/routers/index'
import { createContext } from '@repo/api/context'

const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error: any) => {
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
