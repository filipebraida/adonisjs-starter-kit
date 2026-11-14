import { useState } from 'react'

// Which confirm dialog is open, by key: `useDialogState<'approve' | 'reject'>()`.
export default function useDialogState<T extends string | boolean>(initialState: T | null = null) {
  const [open, setOpen] = useState<T | null>(initialState)

  return [open, setOpen] as const
}
