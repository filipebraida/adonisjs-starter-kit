export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

export function formatCurrency(
  value: number,
  locale: string,
  currency = 'USD',
  options?: Intl.NumberFormatOptions
): string {
  return formatNumber(value, locale, { style: 'currency', currency, ...options })
}

// The value is already in percent units (12.5 means 12.5%), so Intl's
// `style: 'percent'`, which multiplies by 100, does not fit.
export function formatPercent(value: number, locale: string): string {
  return `${formatNumber(value, locale, { maximumFractionDigits: 1 })}%`
}
