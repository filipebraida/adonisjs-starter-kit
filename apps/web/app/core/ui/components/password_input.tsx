import type { ComponentProps } from 'react'

import { PasswordInput as BasePasswordInput } from '@workspace/ui/components/password-input'

import { useTranslation } from '#core/ui/hooks/use_translation'

/** The UI password input with the show/hide toggle named in the user's language. */
export function PasswordInput(props: ComponentProps<typeof BasePasswordInput>) {
  const { t } = useTranslation()

  return (
    <BasePasswordInput
      showLabel={t('core.password.show')}
      hideLabel={t('core.password.hide')}
      {...props}
    />
  )
}
