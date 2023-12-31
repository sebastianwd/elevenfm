import 'reflect-metadata'

import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl'
import responseCachePlugin from '@apollo/server-plugin-response-cache'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { pick } from 'lodash'
import { NextApiHandler, PageConfig } from 'next'
import { parseBody } from 'next/dist/server/api-utils/node/parse-body'
import { buildSchema } from 'type-graphql'

import { ArtistResolver } from '~/server/schema/artist/artist-resolver'
import { SongResolver } from '~/server/schema/song/song-resolver'

const schema = await buildSchema({
  resolvers: [ArtistResolver, SongResolver],
})

const server = new ApolloServer({
  schema,
  introspection: true,
  plugins: [
    ApolloServerPluginCacheControl({
      calculateHttpHeaders: 'if-cacheable',
      defaultMaxAge: 1,
    }),
    responseCachePlugin(),
  ],
  formatError: (error) => {
    return {
      ...pick(error, ['message', 'locations', 'path']),
    }
  },
})

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => {
    return { req, res }
  },
})

const graphql: NextApiHandler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
  }

  const contentType = req.headers['content-type']

  if (contentType && contentType.indexOf('multipart/form-data') > -1) {
    // req.body = await processRequest(req, res); // parse multipart requests with graphql-upload
  } else {
    req.body = await parseBody(req, '10mb')
  }

  try {
    return await handler(req, res)
  } catch (e) {
    res.status(500).send(`Error: ${e instanceof Error ? e.message : `${e}`}`)
  }
}

export default graphql

// // Apollo Server takes care of body parsing
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}
