import { type ClientError } from 'graphql-request'

export const getError = (error: ClientError | null) => {
  if (!error) {
    return ''
  }

  if (error.response?.errors) {
    return error.response.errors[0].message
  }

  return error.message
}
