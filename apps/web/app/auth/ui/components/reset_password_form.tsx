import React from 'react'
import { useForm } from '@inertiajs/react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { PasswordInput } from '@workspace/ui/components/password-input'

export function ResetPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const { data, setData, errors, post } = useForm({
    password: '',
    passwordConfirmation: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    post(window.location.pathname + window.location.search)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="password">New Password</Label>
          <div>
            <PasswordInput
              id="password"
              value={data.password}
              onChange={(element) => setData('password', element.target.value)}
              required
            />
            <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
              {errors?.password}
            </p>
          </div>
          <div>
            <Label htmlFor="passwordConfirmation">Confirm Password</Label>
            <PasswordInput
              id="passwordConfirmation"
              disabled={data.password === ''}
              placeholder="e.g., S3cur3P@ssw0rd"
              value={data.passwordConfirmation}
              onChange={(element) => setData('passwordConfirmation', element.target.value)}
              className={`${errors?.passwordConfirmation ? 'border-red-500' : ''}`}
            />
            <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
              {errors?.passwordConfirmation}
            </p>
          </div>
        </div>
        <Button type="submit" className="w-full">
          Reset Password
        </Button>
      </div>
    </form>
  )
}
