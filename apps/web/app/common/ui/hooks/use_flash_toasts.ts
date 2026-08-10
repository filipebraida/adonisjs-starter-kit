import { usePage } from '@inertiajs/react'
import { useEffect } from 'react'

import { toast } from '@workspace/ui/hooks/use-toast'

export default function useFlashToasts() {
  const { flash } = usePage()

  useEffect(() => {
    if (flash.error) toast.error(flash.error)
  }, [flash.error])

  useEffect(() => {
    if (flash.success) toast.success(flash.success)
  }, [flash.success])
}
