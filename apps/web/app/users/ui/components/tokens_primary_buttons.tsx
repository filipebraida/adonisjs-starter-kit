import { Button } from '@workspace/ui/components/button'
import { TicketPlus } from 'lucide-react'

import { useTokens } from '#users/ui/context/tokens_context'

import useCan from '#common/ui/hooks/use_can'
import { useTranslation } from '#common/ui/hooks/use_translation'

export function TokensPrimaryButtons() {
  const { setOpen } = useTokens()

  const { t } = useTranslation()

  const can = useCan()

  if (!can.manageTokens) return null

  return (
    <div className="flex gap-2">
      <Button size="sm" className="space-x-1" onClick={() => setOpen('add')}>
        <span>{t('users.action.actions.add')}</span> <TicketPlus size={18} />
      </Button>
    </div>
  )
}
