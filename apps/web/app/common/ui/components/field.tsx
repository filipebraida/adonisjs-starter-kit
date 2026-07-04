import React from 'react'

import { Field as BaseField } from '@workspace/ui/components/field'

import { FieldNameContext } from '#common/ui/components/form_context'

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
