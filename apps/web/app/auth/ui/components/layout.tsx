import React from 'react'
import { Link } from '@inertiajs/react'

import { Toaster } from '@workspace/ui/components/toaster'

import { GalleryVerticalEnd } from 'lucide-react'

export interface AuthLayoutProps extends React.PropsWithChildren {}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      <Toaster />

      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              AdonisJS Starter Kit
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">{children}</div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <div className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale">
            <img
              src="https://placehold.co/800x1200?text=Landing"
              alt="Imagem"
              className="object-cover h-full w-full"
            />
          </div>
        </div>
      </div>
    </>
  )
}
