/**
 * The guard of `db:prepare-test`, which wipes what it migrates: only under
 * `NODE_ENV=test` and only a database whose name ends in `_test`.
 */
export function isPreparableTestDatabase(inTest: boolean, database: string): boolean {
  return inTest && database.endsWith('_test')
}
