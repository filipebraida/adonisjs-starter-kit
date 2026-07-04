import React from 'react'
import { Form as InertiaForm } from '@adonisjs/inertia/react'

import { FormErrors, FormErrorsContext } from '#common/ui/components/form_context'

export { Field } from '#common/ui/components/field'
export { FieldError } from '#common/ui/components/field_error'

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
