/**
 * Escapes `%`, `_` and the backslash, LIKE's wildcards and its escape
 * character in Postgres, so a search term matches only itself.
 */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, '\\$&')
}
