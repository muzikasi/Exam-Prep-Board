const STORAGE_KEY = 'examboard_subjects'

const defaultSubjects = ['Mathematics', 'Physics', 'English', 'History', 'Chemistry', 'Economics', 'Biology', 'Civics', 'Aptitude']

export function getSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSubjects.slice()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultSubjects.slice()
    return parsed
  } catch (err) {
    return defaultSubjects.slice()
  }
}

export function saveSubjects(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return true
  } catch (err) {
    return false
  }
}

export function addSubject(name) {
  if (!name || !name.trim()) return { ok: false, message: 'Invalid subject' }
  const subjects = getSubjects()
  if (subjects.map(s => s.toLowerCase()).includes(name.trim().toLowerCase())) {
    return { ok: false, message: 'Subject already exists' }
  }
  const next = [...subjects, name.trim()]
  const ok = saveSubjects(next)
  return ok ? { ok: true, subjects: next } : { ok: false, message: 'Could not save subjects' }
}

export function removeSubject(name) {
  if (!name) return { ok: false }
  const subjects = getSubjects()
  const filtered = subjects.filter(s => s.toLowerCase() !== name.toLowerCase())
  const ok = saveSubjects(filtered)
  return ok ? { ok: true, subjects: filtered } : { ok: false }
}
