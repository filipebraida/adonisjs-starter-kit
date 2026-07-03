import React from 'react'
import { useForm } from '@inertiajs/react'

import { useTranslation } from '#common/ui/hooks/use_translation'
import { urlFor } from '~/app/client'

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
import { Field, FieldLabel } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TokensActionDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation()
  const { data, setData, errors, post, processing, reset } = useForm({ name: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (processing) return

    post(urlFor('tokens.store'), {
      preserveScroll: true,
      onSuccess: () => {
        reset()
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
        if (!state) reset()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>{t('users.tokens.dialogs.add.title')}</DialogTitle>
          <DialogDescription>{t('users.tokens.dialogs.add.description')}</DialogDescription>
        </DialogHeader>
        <form id="token-form" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="name">{t('users.action.form.token.label')}</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder={t('users.action.form.token.placeholder')}
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              disabled={processing}
              className={errors?.name ? 'border-destructive' : undefined}
            />
            <FieldErrorBag errors={errors} field="name" />
          </Field>
        </form>
        <DialogFooter className="gap-y-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={processing}>
              {t('users.action.actions.cancel')}
            </Button>
          </DialogClose>
          <Button type="submit" form="token-form" disabled={processing}>
            {t('users.action.actions.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
