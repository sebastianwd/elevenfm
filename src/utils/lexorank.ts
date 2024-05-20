import { LexoRank } from 'lexorank'

interface HasRank {
  rank?: string | null
}

export function sortByLexoRankAsc(a: HasRank, b: HasRank): number {
  if (!a.rank && b.rank) return -1
  if (a.rank && !b.rank) return 1
  if (!a.rank || !b.rank) return 0

  return a.rank.localeCompare(b.rank)
}

export function getBetweenRankAsc(payload: {
  previous?: HasRank
  next?: HasRank
  item: HasRank
}) {
  const { previous, next, item } = payload

  if (!previous && !!next) {
    return LexoRank.parse(next.rank!).genPrev()
  } else if (!next && !!previous) {
    return LexoRank.parse(previous.rank!).genNext()
  } else if (!!previous && !!next) {
    return LexoRank.parse(next.rank!).between(LexoRank.parse(previous.rank!))
  } else {
    return LexoRank.parse(item.rank!).genNext()
  }
}
