import { compact } from 'es-toolkit'

interface QueryParams {
  [key: string]: string | number | boolean | undefined
}

export const createQueryParam = (param: QueryParams) => {
  const values = Object.keys(param).map((key) => {
    const value = param[key]

    if (value === undefined) return ''

    return `${key}=${value}`
  })

  return compact(values).join('&')
}
