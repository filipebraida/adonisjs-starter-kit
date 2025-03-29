import { Button } from '@workspace/ui/components/button'
import { TicketPlus } from 'lucide-react'

import { useTokens } from '#users/ui/context/tokens_context'

export function TokensPrimaryButtons() {
  const { setOpen } = useTokens()
  return (
    <div className="flex gap-2">
      <Button size="sm" className="space-x-1" onClick={() => setOpen('add')}>
        <span>Add</span> <TicketPlus size={18} />
      </Button>
    </div>
  )
}
