import { Head, router } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'

import { useTranslation } from '#core/ui/hooks/use_translation'

export default function NotFoundError() {
  const { t } = useTranslation()

  return (
    <div className="h-svh">
      <Head title={t('core.errors.not_found.title')} />
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">404</h1>
        <span className="font-medium">Oops! Page Not Found!</span>
        <p className="text-center text-muted-foreground">
          It seems like the page you're looking for <br />
          does not exist or might have been removed.
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.visit('/')}>Back to Home</Button>
        </div>
      </div>
    </div>
  )
}
