const PRACTICE_SETS_KEY = 'adminPracticeSets'

export const readPracticeSets = () => {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(PRACTICE_SETS_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export const savePracticeSets = (sets) => {
  if (typeof window === 'undefined') return sets
  localStorage.setItem(PRACTICE_SETS_KEY, JSON.stringify(sets))
  window.dispatchEvent(new Event('practice-sets-updated'))
  return sets
}
