export function getVisitorSessionId() {
  const key = 'moda-engell-session-id'
  let value = window.sessionStorage.getItem(key)

  if (!value) {
    value = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    window.sessionStorage.setItem(key, value)
  }

  return value
}
