import React from 'react'
import { useForm } from '@inertiajs/react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { PasswordInput } from '@workspace/ui/components/password-input'
import { FieldSet, FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'

export function ResetPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const { data, setData, errors, post } = useForm({
    password: '',
    passwordConfirmation: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/forgot-password')
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">New Password</FieldLabel>
            <PasswordInput
              id="password"
              value={data.password}
              onChange={(element) => setData('password', element.target.value)}
              required
            />
            <FieldErrorBag errors={errors} field="password" />
          </Field>

          <Field>
            <FieldLabel htmlFor="passwordConfirmation">Confirm Password</FieldLabel>
            <PasswordInput
              id="passwordConfirmation"
              disabled={data.password === ''}
              placeholder="e.g., S3cur3P@ssw0rd"
              value={data.passwordConfirmation}
              onChange={(element) => setData('passwordConfirmation', element.target.value)}
              className={`${errors?.passwordConfirmation ? 'border-destructive' : ''}`}
            />
            <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
              {errors?.passwordConfirmation}
            </p>
          </Field>

          <Field orientation="responsive">
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}
