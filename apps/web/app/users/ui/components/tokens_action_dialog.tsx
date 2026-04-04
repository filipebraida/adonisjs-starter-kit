import React, { useState } from 'react'
import { router } from '@inertiajs/react'

import { useTranslation } from '#common/ui/hooks/use_translation'
import { client, urlFor } from '~/app/client'

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
import { Field, FieldError, FieldLabel } from '@workspace/ui/components/field'
import { CopyButton } from '@workspace/ui/components/copy-button'
import { toast } from '@workspace/ui/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TokensActionDialog({ open, onOpenChange }: Props) {
  const [token, setToken] = useState<string | null>(null)
  const [name, setName] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const { t } = useTranslation()

  function resetFormState() {
    setName('')
    setToken(null)
    setProcessing(false)
    setNameError(null)
  }

  function closeAndClean() {
    onOpenChange(false)

    setTimeout(() => {
      resetFormState()
    }, 500)

    router.visit(urlFor('tokens.index'), {
      only: ['tokens'],
      preserveState: true,
      preserveScroll: true,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (processing) return

    setProcessing(true)
    setNameError(null)

    const [result, error] = await client.api.tokens
      .store({
        body: { name: name.length > 0 ? name : undefined },
        headers: {
          Accept: 'application/json',
        },
      })
      .safe()

    if (error) {
      setProcessing(false)

      if (error.isValidationError()) {
        const fieldError = error.response.errors.find((issue) => issue.field === 'name')
        setNameError(fieldError?.message ?? null)
        return
      }

      toast(t('users.action.toast.type_error'), {
        description: error.message,
      })
      return
    }

    setToken(result.token)
    setProcessing(false)

    toast(t('users.action.toast.title'), {
      description: name || t('users.action.form.token.label'),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
        if (!state) {
          setTimeout(() => {
            resetFormState()
          }, 500)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        {!token ? (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="flex items-center gap-2">
                {t('users.tokens.dialogs.add.title')}
              </DialogTitle>
              <DialogDescription>{t('users.tokens.dialogs.add.description')}</DialogDescription>
            </DialogHeader>
            <form id="user-form" onSubmit={handleSubmit}>
              <Field>
                <FieldLabel htmlFor="name">{t('users.action.form.token.label')}</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder={t('users.action.form.token.placeholder')}
                  value={name}
                  onChange={(element) => setName(element.target.value)}
                  disabled={processing}
                  className={nameError ? 'border-destructive' : undefined}
                />
                <FieldError errors={nameError ? [{ message: nameError }] : undefined} />
              </Field>
            </form>
            <DialogFooter className="gap-y-2">
              <DialogClose asChild>
                <Button variant="outline" disabled={processing}>
                  {t('users.action.actions.cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" form="user-form" disabled={processing}>
                {t('users.action.actions.add')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="flex items-center gap-2">
                {t('users.tokens.dialogs.generated.title')}
              </DialogTitle>
              <DialogDescription>
                {t('users.tokens.dialogs.generated.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-row gap-2">
              <Input value={token} readOnly />
              <CopyButton content={token} />
            </div>
            <DialogFooter className="gap-y-2">
              <Button onClick={closeAndClean} variant="outline">
                {t('users.action.actions.close')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
