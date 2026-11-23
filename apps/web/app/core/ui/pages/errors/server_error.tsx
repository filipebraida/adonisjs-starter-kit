import { Head, router } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'

import { useTranslation } from '#core/ui/hooks/use_translation'

export default function ServerError() {
  const { t } = useTranslation()

  return (
    <div className="h-svh w-full">
      <Head title={t('core.errors.server_error.title')} />
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-8xl font-bold leading-tight">500</h1>
        <span className="font-medium">{t('core.errors.server_error.title')}</span>
        <p className="text-center text-muted-foreground">
          {t('core.errors.server_error.description')}
        </p>

        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            {t('core.errors.actions.back')}
          </Button>
          <Button onClick={() => router.visit('/')}>{t('core.errors.actions.home')}</Button>
        </div>
      </div>
    </div>
  )
}
