import { compact, keys } from 'lodash'

interface QueryParams {
  [key: string]: string | number | boolean | undefined
}

export const createQueryParam = (param: QueryParams) => {
  const values = keys(param).map((key) => {
    const value = param[key]

    if (value === undefined) return ''

    return `${key}=${value}`
  })

  return compact(values).join('&')
}
