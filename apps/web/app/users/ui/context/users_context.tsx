import React, { useState } from 'react'

import User from '#users/dtos/user'
import useDialogState from '#common/ui/hooks/use_dialog_state'

type UsersDialogType = 'add' | 'edit' | 'delete' | 'invite' | 'impersonate'

interface UsersContextType {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UsersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

  return (
    <UsersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UsersContext.Provider>
  )
}

export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
