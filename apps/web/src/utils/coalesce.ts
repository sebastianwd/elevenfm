export function coalesce<T>(
  obj: { [key: string]: T | undefined },
  keys: string[],
  defaultValue: T
): T {
  for (const key of keys) {
    if (obj[key] !== undefined) {
      return obj[key]!
    }
  }
  return defaultValue
}
