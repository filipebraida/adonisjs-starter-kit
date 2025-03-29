import React, { useState } from 'react'

import type TokenDto from '#users/dtos/token'
import useDialogState from '#common/ui/hooks/use_dialog_state'

type TokensDialogType = 'add' | 'delete'

interface TokensContextType {
  open: TokensDialogType | null
  setOpen: (str: TokensDialogType | null) => void
  currentRow: TokenDto | null
  setCurrentRow: React.Dispatch<React.SetStateAction<TokenDto | null>>
}

const TokensContext = React.createContext<TokensContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TokensProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TokensDialogType>(null)
  const [currentRow, setCurrentRow] = useState<TokenDto | null>(null)

  return (
    <TokensContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TokensContext.Provider>
  )
}

export const useTokens = () => {
  const usersContext = React.useContext(TokensContext)

  if (!usersContext) {
    throw new Error('useTokens has to be used within <TokensContext>')
  }

  return usersContext
}
