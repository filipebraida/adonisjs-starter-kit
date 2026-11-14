import React from 'react'

import { cn } from '@workspace/ui/lib/utils'

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Main = ({ fixed, ...props }: MainProps) => {
  return (
    <main
      className={cn(
        'peer-[.header-fixed]/header:mt-16',
        'py-6',
        fixed && 'fixed-main flex flex-col flex-grow overflow-hidden'
      )}
      {...props}
    />
  )
}

Main.displayName = 'Main'
