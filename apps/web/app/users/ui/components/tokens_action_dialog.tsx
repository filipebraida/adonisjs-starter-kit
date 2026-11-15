import { Field, FieldError, Form } from '#core/ui/components/form'
import { useTranslation } from '#core/ui/hooks/use_translation'

import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { FieldLabel } from '@workspace/ui/components/field'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TokensActionDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation()

  // The dialog unmounts its content on close, so a reopened form starts empty.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>{t('users.tokens.dialogs.add.title')}</DialogTitle>
          <DialogDescription>{t('users.tokens.dialogs.add.description')}</DialogDescription>
        </DialogHeader>
        <Form
          route="tokens.store"
          options={{ preserveScroll: true }}
          resetOnSuccess
          onSuccess={() => onOpenChange(false)}
          className="contents"
        >
          {({ processing, errors }) => (
            <>
              <Field name="name">
                <FieldLabel htmlFor="name">{t('users.action.form.token.label')}</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder={t('users.action.form.token.placeholder')}
                  disabled={processing}
                  aria-invalid={!!errors.name}
                />
                <FieldError />
              </Field>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={processing}>
                    {t('users.action.actions.cancel')}
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                  {t('users.action.actions.add')}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  )
}
