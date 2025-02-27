import React from 'react'
import { Link } from '@inertiajs/react'

import { UserAvatar } from '#common/ui/components/user_avatar'

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

import UserDto from '#users/dtos/user'

export type NavUserOptionsGroup = {
  title: string
  url: string
  icon: LucideIcon
  shortcut?: string
}[]

export interface NavUserProps {
  user: UserDto
  options: NavUserOptionsGroup[]
}

export function NavUser({ user, options }: NavUserProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <UserAvatar className="cursor-pointer" user={user} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="bottom" align="end">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserAvatar className="rounded-lg" user={user} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.fullName ?? ''}</span>
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
