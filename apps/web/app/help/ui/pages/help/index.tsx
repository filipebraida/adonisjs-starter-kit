import { Head } from '@inertiajs/react'

import { useTranslation } from '#core/ui/hooks/use_translation'

// Filled in by the help UI task.
export default function HelpPage() {
  const { t } = useTranslation()
  return <Head title={t('help.title')} />
}
