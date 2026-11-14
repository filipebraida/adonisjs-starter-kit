import { DateTime } from 'luxon'

type DateInput = string | Date

function toDate(value: DateInput): Date {
  return typeof value === 'string' ? new Date(value) : value
}

export function formatDate(
  value: DateInput,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return toDate(value).toLocaleDateString(locale, options)
}

export function formatDateTime(
  value: DateInput,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return toDate(value).toLocaleString(locale, options)
}

export function formatRelativeTime(value: DateInput, locale: string): string {
  return DateTime.fromJSDate(toDate(value)).setLocale(locale).toRelative() ?? ''
}
