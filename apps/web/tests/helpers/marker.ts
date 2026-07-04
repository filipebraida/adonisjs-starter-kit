import { randomBytes } from 'node:crypto'

// `Zz` prefix so tagged rows sink to the tail of alphabetical listings.
export function marker(prefix: string): string {
  const suffix = randomBytes(4).toString('hex')
  return `Zz${prefix}${suffix}`
}

export function taggedEmail(mark: string): string {
  return `${mark.toLowerCase()}@example.test`
}
