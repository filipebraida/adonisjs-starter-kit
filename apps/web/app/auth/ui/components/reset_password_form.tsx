import { Field, FieldError, Form } from '#common/ui/components/form'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { PasswordInput } from '@workspace/ui/components/password-input'
import { FieldSet, FieldGroup, FieldLabel } from '@workspace/ui/components/field'

export function ResetPasswordForm({ token, className }: { token: string; className?: string }) {
  return (
    <Form
      route="auth.reset_password.handle"
      routeParams={{ token }}
      className={cn('flex flex-col gap-6', className)}
    >
      {({ processing }) => (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-balance text-sm text-muted-foreground">
              Choose a new password for your account.
            </p>
          </div>

          <FieldSet>
            <FieldGroup>
              <Field name="password">
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <PasswordInput id="password" name="password" required />
                <FieldError />
              </Field>

              <Field name="passwordConfirmation">
                <FieldLabel htmlFor="passwordConfirmation">Confirm Password</FieldLabel>
                <PasswordInput
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  placeholder="e.g., S3cur3P@ssw0rd"
                />
                <FieldError />
              </Field>

              <Field orientation="responsive">
                <Button type="submit" className="w-full" disabled={processing}>
                  Reset Password
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </>
      )}
    </Form>
  )
}
