/* eslint-disable @typescript-eslint/no-empty-object-type */
import { LRUCache } from 'lru-cache'

class Cache<K extends {} = string, V extends {} = string> {
  private cache: LRUCache<K, V>
  constructor() {
    this.cache = new LRUCache({
      max: 50,
      ttl: 1000 * 60 * 60 * 12,
    })
  }

  get(key: K) {
    const value = this.cache.get(key)

    return value
  }

  set(key: K, value: V) {
    this.cache.set(key, value)
  }

  has(key: K) {
    return this.cache.has(key)
  }
}

export const cache = new Cache()
