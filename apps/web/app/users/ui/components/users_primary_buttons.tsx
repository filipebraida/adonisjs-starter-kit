import { Button } from '@workspace/ui/components/button'
import { UserPlus } from 'lucide-react'

import { useUsers } from '#users/ui/context/users_context'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  return (
    <div className="flex gap-2">
      <Button size="sm" className="space-x-1" onClick={() => setOpen('add')}>
        <span>Add</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
