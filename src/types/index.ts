import { type BaseContext } from '@apollo/server'
import { type Session } from 'next-auth'

export interface Context extends BaseContext {
  session: Session | null
}
