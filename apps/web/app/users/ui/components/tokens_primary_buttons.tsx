import { Can } from '@casl/react'

import { Button } from '@workspace/ui/components/button'
import { TicketPlus } from 'lucide-react'

import { useTokens } from '#users/ui/context/tokens_context'
import { useAbility } from '#users/ui/context/abilities_context'

export function TokensPrimaryButtons() {
  const { setOpen } = useTokens()

  const ability = useAbility()

  return (
    <div className="flex gap-2">
      <Can I="create" a="token" ability={ability}>
        <Button size="sm" className="space-x-1" onClick={() => setOpen('add')}>
          <span>Add</span> <TicketPlus size={18} />
        </Button>
      </Can>
    </div>
  )
}
