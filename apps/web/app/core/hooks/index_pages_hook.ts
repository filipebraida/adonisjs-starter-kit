import type { AllHooks, IndexGeneratorSourceConfig } from '@adonisjs/assembler/types'

const TYPES_EXTRACTION_HELPER = `import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never`

type IndexGeneratorAs = Extract<IndexGeneratorSourceConfig, { as: (...args: any[]) => void }>['as']
type IndexGeneratorAsParams = Parameters<IndexGeneratorAs>

const indexAppUiPagesHook: AllHooks['init'][number] = {
  run(_parent, _hooks, indexGenerator) {
    indexGenerator.add('inertiaPages', {
      source: 'app',
      glob: ['**/*.ts', '**/*.tsx'],
      filter: (filePath: string, isDir: boolean) => {
        if (isDir) {
          return true
        }

        return filePath.includes('/ui/pages/') || filePath.includes('\\ui\\pages\\')
      },
      output: '.adonisjs/server/pages.d.ts',
      as(
        vfs: IndexGeneratorAsParams[0],
        buffer: IndexGeneratorAsParams[1],
        _config: IndexGeneratorAsParams[2],
        helpers: IndexGeneratorAsParams[3]
      ) {
        const filesList = vfs.asList()

        buffer.writeLine(`import '@adonisjs/inertia/types'`)
        buffer.writeLine(TYPES_EXTRACTION_HELPER)
        buffer.write(`declare module '@adonisjs/inertia/types' {`).indent()
        buffer.write(`export interface InertiaPages {`).indent()

        Object.keys(filesList).forEach((key) => {
          const pageKey = key
            .replace(/^\.\//, '')
            .replace(/[\\/]ui[\\/]pages[\\/]/, '/')
            .replace(/\.(ts|tsx)$/, '')
          buffer.write(
            `'${pageKey}': ExtractProps<(typeof import('${helpers.toImportPath(
              filesList[key]
            )}'))['default']>`
          )
        })

        buffer.dedent().write(`}`)
        buffer.dedent().write(`}`)
      },
    })
  },
}

export const indexAppUiPages = function () {
  return indexAppUiPagesHook
}

export default indexAppUiPages
