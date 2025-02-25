import React, { useEffect, useState } from 'react'
import { Link, useForm } from '@inertiajs/react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import useFlashMessage from '#common/ui/hooks/use_flash_message'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const { data, setData, errors, post } = useForm({
    email: '',
    password: '',
  })

  const [invalidCreditials, setInvalidCreditials] = useState(false)

  const messages = useFlashMessage('errors')

  useEffect(() => {
    if (messages) {
      setInvalidCreditials(true)
    }
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    post('/login', {
      onError: (errors) => {
        if ('E_INVALID_CREDENTIALS' in errors) {
          setInvalidCreditials(true)
        }
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to access your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(element) => setData('email', element.target.value)}
              placeholder="m@ufrrj.br"
              className={`${errors?.email || invalidCreditials ? 'border-red-500' : ''}`}
              required
            />
            <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
              {errors?.email}
            </p>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <div>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(element) => setData('password', element.target.value)}
              className={`${errors?.password || invalidCreditials ? 'border-red-500' : ''}`}
              required
            />
            <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
              {errors?.password}
            </p>
          </div>
        </div>
        <div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
          {invalidCreditials && (
            <p className="text-[0.8rem] text-center font-medium text-destructive col-span-1">
              Invalid email or password
            </p>
          )}
        </div>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <a href="/google/redirect">
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>
            Sign in with Google
          </a>
        </Button>
      </div>
      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Link href="/sign-up" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  )
}
