import type { AllHooks, IndexGeneratorSourceConfig } from '@adonisjs/assembler/types'

type IndexGeneratorAs = Extract<IndexGeneratorSourceConfig, { as: (...args: any[]) => void }>['as']
type IndexGeneratorAsParams = Parameters<IndexGeneratorAs>

/**
 * Types the frontend's translation keys from the English JSON files, so a
 * missing key in `t('...')` fails the typecheck. The namespace is the file
 * name, as in `core/ui/app/i18n.ts` and on the server: `errors.json` → `errors.*`.
 */
const indexTranslationsHook: AllHooks['init'][number] = {
  run(_parent, _hooks, indexGenerator) {
    indexGenerator.add('translations', {
      source: 'app',
      glob: ['**/resources/lang/en/*.json'],
      output: '.adonisjs/client/i18n.d.ts',
      as(
        vfs: IndexGeneratorAsParams[0],
        buffer: IndexGeneratorAsParams[1],
        _config: IndexGeneratorAsParams[2],
        helpers: IndexGeneratorAsParams[3]
      ) {
        const filesList = vfs.asList()
        const byNamespace = new Map<string, string[]>()

        for (const key of Object.keys(filesList).sort()) {
          const namespace = key.split(/[\\/]/).pop()!
          const files = byNamespace.get(namespace) ?? []
          files.push(`typeof import('${helpers.toImportPath(filesList[key])}')`)
          byNamespace.set(namespace, files)
        }

        buffer.writeLine(`import 'i18next'`)
        buffer.write(`declare module 'i18next' {`).indent()
        buffer.write(`interface CustomTypeOptions {`).indent()
        buffer.write(`resources: {`).indent()
        buffer.write(`translation: {`).indent()
        for (const [namespace, files] of byNamespace) {
          buffer.write(`${namespace}: ${files.join(' & ')}`)
        }
        buffer.dedent().write(`}`)
        buffer.dedent().write(`}`)
        buffer.dedent().write(`}`)
        buffer.dedent().write(`}`)
      },
    })
  },
}

export const indexTranslations = function () {
  return indexTranslationsHook
}

export default indexTranslations
