import { useEffect } from 'react'

import useFlashMessage from '#common/ui/hooks/use_flash_message'
import { toast } from '@workspace/ui/hooks/use-toast'

export default function useFlashToasts() {
  const error = useFlashMessage('error')
  const success = useFlashMessage('success')

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  useEffect(() => {
    if (success) toast.success(success)
  }, [success])
}
