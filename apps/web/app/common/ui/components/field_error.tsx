import React, { use } from 'react'

import { FieldError as BaseFieldError } from '@workspace/ui/components/field'

import { FieldNameContext, FormErrorsContext } from '#common/ui/components/form_context'

export function FieldError(props: React.ComponentProps<typeof BaseFieldError>) {
  const errors = use(FormErrorsContext)
  const fieldName = use(FieldNameContext)

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
