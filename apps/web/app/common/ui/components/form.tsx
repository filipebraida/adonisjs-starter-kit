import React, { createContext, useContext } from 'react'
import { Form as InertiaForm } from '@adonisjs/inertia/react'

import { Field as BaseField, FieldError as BaseFieldError } from '@workspace/ui/components/field'

type FormErrors = Record<string, string | string[] | undefined>

const FormErrorsContext = createContext<FormErrors | undefined>(undefined)
const FieldNameContext = createContext<string | undefined>(undefined)

type InertiaChildren = React.ComponentProps<typeof InertiaForm>['children']
type FormSlotProps = InertiaChildren extends
  | React.ReactNode
  | ((props: infer Props) => React.ReactNode)
  ? Props
  : never

type AppFormProps = Record<string, unknown> & {
  children: React.ReactNode | ((props: FormSlotProps) => React.ReactNode)
}

export function Form(props: AppFormProps) {
  const { children, ...formProps } = props

  return (
    <InertiaForm {...(formProps as any)}>
      {(slotProps) => (
        <FormErrorsContext.Provider value={slotProps.errors as FormErrors | undefined}>
          {typeof children === 'function' ? children(slotProps) : children}
        </FormErrorsContext.Provider>
      )}
    </InertiaForm>
  )
}

export function Field({
  name,
  ...props
}: React.ComponentProps<typeof BaseField> & { name?: string }) {
  return (
    <FieldNameContext.Provider value={name}>
      <BaseField {...props} />
    </FieldNameContext.Provider>
  )
}

export function FieldError(props: React.ComponentProps<typeof BaseFieldError>) {
  const errors = useContext(FormErrorsContext)
  const fieldName = useContext(FieldNameContext)

  if (props.errors) {
    return <BaseFieldError {...props} />
  }

  if (!fieldName || !errors) {
    return <BaseFieldError {...props} />
  }

  const value = errors[fieldName]
  const issues = Array.isArray(value)
    ? value.filter(Boolean).map((message) => ({ message: String(message) }))
    : value
      ? [{ message: String(value) }]
      : undefined

  return <BaseFieldError {...props} errors={issues} />
}
