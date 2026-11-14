import React from 'react'

import { Field as BaseField } from '@workspace/ui/components/field'

import { FieldNameContext } from '#core/ui/components/form_context'

export function Field({
  name,
  ...props
}: React.ComponentProps<typeof BaseField> & { name?: string }) {
  return (
    <FieldNameContext value={name}>
      <BaseField {...props} />
    </FieldNameContext>
  )
}
