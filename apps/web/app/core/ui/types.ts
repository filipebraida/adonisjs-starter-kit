import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import type { Data } from '@generated/data'
import type { PropsWithChildren } from 'react'

export type InertiaProps<T extends JSONDataTypes = {}> = PropsWithChildren<Data.SharedProps & T>
