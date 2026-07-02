export function formatTimeAgo(date: Date | string): string {
  const now  = new Date()
  const then = new Date(date)
  if (Number.isNaN(then.getTime())) return 'Unknown'
  const diffMs    = now.getTime() - then.getTime()
  const diffMins  = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays  = Math.floor(diffMs / 86400000)
  if (diffMins  <  1) return 'Just now'
  if (diffMins  < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0] ?? '').join('').toUpperCase()
}

export function formatHeaderDate(): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
}

export function formatExamDate(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'Invalid date'
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }).format(parsed)
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date))
}

export function extractTargetScore(notes?: string | null): string | null {
  if (!notes) return null
  const match = notes.match(/Target Score\/Band:\s*([^\n,]+)/i)
  return match ? match[1].trim() : null
}
