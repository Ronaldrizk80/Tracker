import { differenceInCalendarDays, parseISO, format, isValid } from 'date-fns'

// Returns days elapsed since "anchor" (due_date if set, else created_at)
// Positive = overdue, negative = future
export function getAgeDays(task) {
  const anchor = task.due_date || task.created_at
  if (!anchor) return 0
  const d = typeof anchor === 'string' ? parseISO(anchor) : anchor
  if (!isValid(d)) return 0
  return differenceInCalendarDays(new Date(), d)
}

// Aging bucket: 0-3, 4-7, 8-14, 15+
export function getAgingBucket(task) {
  if (task.status === 'done') return 'done'
  if (task.status === 'snoozed' && task.snooze_until) {
    const su = parseISO(task.snooze_until)
    if (isValid(su) && su > new Date()) return 'snoozed'
  }
  const age = getAgeDays(task)
  if (age >= 15) return '15+'
  if (age >= 8) return '8-14'
  if (age >= 4) return '4-7'
  return '0-3'
}

export function getStatusClass(task) {
  if (task.status === 'done') return 'status-done'
  if (task.status === 'snoozed') return 'status-snoozed'
  const bucket = getAgingBucket(task)
  if (bucket === '15+') return 'status-overdue'
  if (bucket === '8-14') return 'status-warn'
  return 'status-ok'
}

export function getAgeClass(task) {
  if (task.status === 'done' || task.status === 'snoozed') return ''
  const bucket = getAgingBucket(task)
  if (bucket === '15+') return 'age-overdue'
  if (bucket === '8-14') return 'age-warn'
  return ''
}

export function formatAge(task) {
  const age = getAgeDays(task)
  if (age < 0) return `in ${Math.abs(age)}d`
  if (age === 0) return 'today'
  return `${age}d`
}

export function formatDate(d) {
  if (!d) return ''
  const parsed = typeof d === 'string' ? parseISO(d) : d
  if (!isValid(parsed)) return ''
  return format(parsed, 'd MMM')
}
