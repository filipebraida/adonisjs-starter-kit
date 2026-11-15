import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The `app/<module>/<folder>` paths that exist, relative to `appRoot`
 * (`app/auth/workflows`, `app/users/workflows`). Lets the config and the
 * assembler hooks find a module's folder instead of keeping a list by hand.
 */
export function moduleDirs(appRoot: string, folder: string): string[] {
  return readdirSync(join(appRoot, 'app'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `app/${entry.name}/${folder}`)
    .filter((path) => existsSync(join(appRoot, path)))
    .sort()
}
