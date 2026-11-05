// The API's review objects do not say who wrote them, so the browser remembers
// the ids of reviews it created in order to offer Edit / Delete on them.
// (Suggested API improvement: include an `isMine` flag on authenticated reads.)

const KEY = 'vt_my_reviews'

const read = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, string>
  } catch {
    return {}
  }
}

const write = (value: Record<string, string>) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // Storage blocked: the edit/delete shortcut simply will not be offered.
  }
}

const keyFor = (userId: string, slug: string) => `${userId}:${slug}`

export const getMyReviewId = (userId: string, slug: string): string | undefined => read()[keyFor(userId, slug)]

export const rememberMyReview = (userId: string, slug: string, reviewId: string) =>
  write({ ...read(), [keyFor(userId, slug)]: reviewId })

export const forgetMyReview = (userId: string, slug: string) => {
  const all = read()
  delete all[keyFor(userId, slug)]
  write(all)
}
