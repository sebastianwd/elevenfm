import { type ClientError } from 'graphql-request'
import { truncate } from 'lodash'

export const getError = (error: ClientError | null) => {
  if (!error) {
    return ''
  }

  if (error.response?.errors) {
    return error.response.errors[0].message
  }

  return truncate(String(error.message), { length: 50 })
}
