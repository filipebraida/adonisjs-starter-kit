import { createContext } from 'react'

export type FormErrors = Record<string, string | string[] | undefined>

export const FormErrorsContext = createContext<FormErrors | undefined>(undefined)
export const FieldNameContext = createContext<string | undefined>(undefined)
