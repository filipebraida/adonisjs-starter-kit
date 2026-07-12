import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Scaffold a new bounded-context module AND wire every manual registration
 * step, so the touchpoints that otherwise fail silently at runtime (preloads,
 * migration paths, i18n loaders, tsconfig include) are never forgotten.
 *
 * @example
 *   node ace make:module billing
 *   node ace make:module billing --db --i18n --events
 */
export default class MakeModule extends BaseCommand {
  static commandName = 'make:module'
  static description = 'Scaffold a new app/<module>/ and wire its config touchpoints'
  static options: CommandOptions = { startApp: false }

  @args.string({ description: 'Module name (lowercase, snake_case): billing, user_profile' })
  declare name: string

  @flags.boolean({ description: 'Add database/migrations and register its path' })
  declare db: boolean

  @flags.boolean({
    flagName: 'i18n',
    description: 'Add resources/lang (en/fr/pt) and register the i18n loader',
  })
  declare i18n: boolean

  @flags.boolean({ description: 'Add start/events.ts + types/events.ts and preload them' })
  declare events: boolean

  private get pascal(): string {
    return this.name
      .split(/[_-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  }

  /** Create a file under app/<name>/, skipping (never overwriting) if it exists. */
  private make(relInModule: string, contents: string): void {
    const path = this.app.makePath('app', this.name, relInModule)
    const rel = `app/${this.name}/${relInModule}`
    if (existsSync(path)) {
      this.logger.info(`skip   ${rel} (exists)`)
      return
    }
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, contents)
    this.logger.success(`create ${rel}`)
  }

  /** Insert `insertion` into `configRel` right before `anchor`, once. */
  private wire(configRel: string, alreadyThere: string, anchor: string, insertion: string): void {
    const path = this.app.makePath(configRel)
    const src = readFileSync(path, 'utf-8')
    if (src.includes(alreadyThere)) {
      this.logger.info(`skip   ${configRel} (already wired)`)
      return
    }
    if (!src.includes(anchor)) {
      this.logger.error(`could not wire ${configRel}: anchor not found — wire ${this.name} by hand`)
      return
    }
    writeFileSync(path, src.replace(anchor, `${insertion}${anchor}`))
    this.logger.success(`wire   ${configRel}`)
  }

  async run(): Promise<void> {
    if (!/^[a-z][a-z0-9_]*$/.test(this.name)) {
      this.logger.error(`Invalid module name "${this.name}" — use lowercase snake_case`)
      this.exitCode = 1
      return
    }
    if (existsSync(this.app.makePath('app', this.name))) {
      this.logger.error(`app/${this.name}/ already exists`)
      this.exitCode = 1
      return
    }

    const { name, pascal } = this

    // ---- base skeleton -----------------------------------------------------
    this.make(
      'routes.ts',
      `import router from '@adonisjs/core/services/router'\n\n` +
        `const ${pascal}Controller = () => import('#${name}/controllers/${name}_controller')\n\n` +
        `router.get('/${name}', [${pascal}Controller, 'index']).as('${name}.index')\n`
    )
    this.make(
      `controllers/${name}_controller.ts`,
      `import type { HttpContext } from '@adonisjs/core/http'\n\n` +
        `export default class ${pascal}Controller {\n` +
        `  async index({ inertia }: HttpContext) {\n` +
        `    return inertia.render('${name}/index', {})\n` +
        `  }\n}\n`
    )
    this.make(
      'ui/pages/index.tsx',
      `export default function ${pascal}IndexPage() {\n` +
        `  return <h1>${pascal}</h1>\n}\n`
    )
    this.make(
      `tests/functional/${name}.spec.ts`,
      `import { test } from '@japa/runner'\n\n` +
        `test.group('${pascal} index', () => {\n` +
        `  test('GET /${name} renders', async ({ client }) => {\n` +
        `    const response = await client.get('/${name}')\n` +
        `    response.assertStatus(200)\n` +
        `  })\n})\n`
    )

    // ---- always-on wiring ---------------------------------------------------
    this.wire(
      'package.json',
      `"#${name}/*"`,
      `    "#providers/*":`,
      `    "#${name}/*": "./app/${name}/*.js",\n`
    )
    this.wirePreloads()
    // The client tsconfig needs each module's ui/ globs, plus its types/ glob
    // when the module augments EventsList — without it the events declaration
    // merge is invisible to the client tsc and typecheck breaks.
    let tsInclude = `    "../../${name}/ui/**/*.ts",\n    "../../${name}/ui/**/*.tsx",\n`
    if (this.events) tsInclude += `    "../../${name}/types/**/*.ts",\n`
    this.wire(
      'app/core/ui/tsconfig.json',
      `../../${name}/ui/`,
      `    "../../../config/auth.ts"`,
      tsInclude
    )

    // ---- optional: database -------------------------------------------------
    if (this.db) {
      this.make('database/migrations/.gitkeep', '')
      this.wireDatabasePath()
    }

    // ---- optional: i18n -----------------------------------------------------
    if (this.i18n) {
      for (const locale of ['en', 'fr', 'pt']) {
        this.make(`resources/lang/${locale}/${name}.json`, '{}\n')
      }
      this.wire(
        'config/i18n.ts',
        `app/${name}/resources/lang`,
        `  ],\n})`,
        `    loaders.fs({\n      location: app.makePath('app/${name}/resources/lang'),\n    }),\n`
      )
    }

    // ---- optional: events ---------------------------------------------------
    if (this.events) {
      this.make(
        'types/events.ts',
        `declare module '@adonisjs/core/types' {\n` +
          `  interface EventsList {\n` +
          `    // '${name}:created': ${pascal}CreatedEvent\n` +
          `  }\n}\n\nexport {}\n`
      )
      this.make(
        'start/events.ts',
        `// Register domain event listeners here, e.g.:\n` +
          `//   import emitter from '@adonisjs/core/services/emitter'\n` +
          `//   emitter.on('${name}:created', (event) => { ... })\n\n` +
          `export {}\n`
      )
    }

    this.nextSteps()
  }

  /** Inject preload lines into the preloads array specifically (not commands/providers). */
  private wirePreloads(): void {
    const path = this.app.makePath('adonisrc.ts')
    const src = readFileSync(path, 'utf-8')
    if (src.includes(`#${this.name}/routes`)) {
      this.logger.info('skip   adonisrc.ts (already wired)')
      return
    }
    const lines = [`    //${this.name}`, `    () => import('#${this.name}/routes'),`]
    if (this.events) lines.push(`    () => import('#${this.name}/start/events'),`)
    const block = `\n\n${lines.join('\n')}`

    // Match `preloads: [ ...entries... \n  ],` and append before the closing `]`.
    const updated = src.replace(
      /(preloads:\s*\[)([\s\S]*?)(\n {2}\],)/,
      (_match, open, body, close) => `${open}${body}${block}${close}`
    )
    if (updated === src) {
      this.logger.error('could not wire adonisrc.ts preloads — add the routes preload by hand')
      return
    }
    writeFileSync(path, updated)
    this.logger.success('wire   adonisrc.ts')
  }

  private wireDatabasePath(): void {
    const path = this.app.makePath('config/database.ts')
    const src = readFileSync(path, 'utf-8')
    const needle = `app/${this.name}/database/migrations`
    if (src.includes(needle)) {
      this.logger.info('skip   config/database.ts (already wired)')
      return
    }
    const updated = src.replace(
      /(migrations:\s*\{[^}]*paths:\s*\[)([^\]]*)(\])/,
      (_match, pre, list, post) => `${pre}${list.trimEnd().replace(/,\s*$/, '')}, '${needle}'${post}`
    )
    if (updated === src) {
      this.logger.error('could not wire config/database.ts — add the migrations path by hand')
      return
    }
    writeFileSync(path, updated)
    this.logger.success('wire   config/database.ts')
  }

  private nextSteps(): void {
    this.logger.log('')
    this.logger.info(`Module app/${this.name}/ created and wired.`)
    this.logger.info('Next: run `pnpm dev` (or `node ace ...`) to regenerate route/page types,')
    this.logger.info('then `pnpm typecheck`.')
    if (this.db) this.logger.info('DB: add migrations under database/migrations, then `pnpm ace migration:fresh`.')
  }
}
