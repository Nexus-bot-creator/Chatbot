export const API_BASE = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.REACT_APP_API_BASE_URL as string) || 'http://localhost:8000') as string

export function uuid() {
  if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) return (crypto as any).randomUUID()
  // fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
