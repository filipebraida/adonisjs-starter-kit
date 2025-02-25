import { Link } from '@inertiajs/react'

import { LucideIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'

import React from 'react'

export type NavUserOptionsGroup = {
  title: string
  url: string
  icon: LucideIcon
  shortcut?: string
}[]

export interface NavUserProps {
  user: {
    name?: string
    email: string
    avatar?: string
  }
  options: NavUserOptionsGroup[]
}

function generateFallbackText(user: { name?: string; email: string }): string {
  if (user.name) {
    const initials = user.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    return initials
  }
  return user.email.slice(0, 2).toUpperCase()
}

export function NavUser({ user, options }: NavUserProps) {
  const fallbackText = generateFallbackText(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="uppercase">{fallbackText}</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="bottom" align="end">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">{fallbackText}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {groupIndex > 0 && <DropdownMenuSeparator />}

            {group.map((option) => (
              <Link key={option.title} href={option.url}>
                <DropdownMenuItem className="cursor-pointer">
                  <option.icon />
                  <span>{option.title}</span>
                  {option.shortcut && (
                    <DropdownMenuShortcut>{option.shortcut}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              </Link>
            ))}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
