import { Modal } from 'adonis-inertia-modal/react'

import { Button } from '@workspace/ui/components/button'
import { FieldDescription, FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'

import { Field, FieldError, Form } from '#core/ui/components/form'
import { useTranslation } from '#core/ui/hooks/use_translation'

export default function CreateRolePage() {
  const { t } = useTranslation()

  return (
    <Modal maxWidth="md">
      {({ close }) => (
        <div className="space-y-4">
          <header className="space-y-1 text-left">
            <h2 className="text-lg font-semibold">{t('auth.roles.create.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('auth.roles.create.description')}</p>
          </header>

          <Form route="roles.store" options={{ preserveScroll: true }} onSuccess={close}>
            {({ errors, processing }) => (
              <>
                <Field name="name">
                  <FieldLabel htmlFor="name">{t('auth.roles.create.label')}</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    placeholder={t('auth.roles.create.placeholder')}
                    aria-invalid={!!errors.name}
                  />
                  <FieldDescription>{t('auth.roles.create.hint')}</FieldDescription>
                  <FieldError />
                </Field>

                <footer className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={close}>
                    {t('auth.roles.cancel')}
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {t('auth.roles.create.submit')}
                  </Button>
                </footer>
              </>
            )}
          </Form>
        </div>
      )}
    </Modal>
  )
}
