export const DECIMAL_RE = /^-?\d*\.?\d*$/

export function toNum(v: string | number): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.includes(',')) {
    const parts = v
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n))
    if (parts.length === 0) return 0
    return parts.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a), 0)
  }
  return parseFloat(v) || 0
}
