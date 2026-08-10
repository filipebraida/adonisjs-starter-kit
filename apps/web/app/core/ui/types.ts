import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import type { Data } from '@generated/data'
import type { PropsWithChildren } from 'react'

export type InertiaProps<T extends JSONDataTypes = {}> = PropsWithChildren<Data.SharedProps & T>

/**
 * Bridges the server side types into the Inertia client. "usePage().props" is
 * typed from the Inertia middleware share method and "usePage().flash" from
 * its flash method.
 */
declare module '@inertiajs/core' {
  interface InertiaConfig {
    sharedPageProps: Data.SharedProps
    flashDataType: Data.FlashMessages
  }
}
