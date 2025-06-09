import React from 'react'

import { Toaster } from '@workspace/ui/components/sonner'

import { AppLogo } from '#common/ui/components/app_logo'

import illustration from '../images/login_illustration.png'

export interface AuthLayoutProps extends React.PropsWithChildren {}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      <Toaster />

      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <AppLogo />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">{children}</div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 p-8">
            <img src={illustration} alt="Ilustração de login" className="max-h-full max-w-full" />
          </div>
        </div>
      </div>
    </>
  )
}
