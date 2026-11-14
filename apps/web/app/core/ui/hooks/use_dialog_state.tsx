import { useState } from 'react'

/**
 * Custom hook for confirm dialog
 * @param initialState string | null
 * @returns A stateful value, and a function to update it.
 * @example const [open, setOpen] = useDialogState<"approve" | "reject">()
 */
export default function useDialogState<T extends string | boolean>(initialState: T | null = null) {
  const [open, _setOpen] = useState<T | null>(initialState)

  const setOpen = (value: T | null) => _setOpen(value)

  return [open, setOpen] as const
}
