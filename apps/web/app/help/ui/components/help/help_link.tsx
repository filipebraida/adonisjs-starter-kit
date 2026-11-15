import { CircleHelp } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@workspace/ui/components/button'

import usePageProps from '#core/ui/hooks/use_page_props'
import { useTranslation } from '#core/ui/hooks/use_translation'
import { helpTargetOf, type HelpAnchorKey } from '#help/enums/help_anchors'
import { helpLocaleOf } from '#help/enums/help_locale'
import { HelpPanel } from '#help/ui/components/help/help_panel'

/**
 * A screen's "?", beside a title (`Heading`, `SettingsSection`): opens the
 * article of its help point (`HELP_ANCHORS`) in a drawer. Nothing shows when the person may not read that article.
 */
export function HelpLink({ anchor }: { anchor: HelpAnchorKey }) {
  const { t, language } = useTranslation()
  const { helpArticles } = usePageProps<{ helpArticles?: string[] }>()
  const [open, setOpen] = useState(false)
  const target = helpTargetOf(anchor, helpArticles ?? [], helpLocaleOf(language))
  if (!target) return null

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t('help.open')}
        title={t('help.open')}
        onClick={() => setOpen(true)}
      >
        <CircleHelp aria-hidden />
      </Button>
      <HelpPanel open={open} onOpenChange={setOpen} {...target} />
    </>
  )
}
