import React from 'react'
import { Link } from '@inertiajs/react'

import { UserAvatar } from '#core/ui/components/user_avatar'
import useAllows from '#core/ui/hooks/use_allows'
import type { NavUserProps } from '#core/ui/app/navigation_types'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

export function NavUser({ user, options }: NavUserProps) {
  const allows = useAllows()
  const visibleGroups = options
    .map((group) => group.filter((option) => allows(option.can)))
    .filter((group) => group.length > 0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <UserAvatar className="cursor-pointer" user={user} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="bottom" align="end">
        <div className="text-muted-foreground">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserAvatar user={user} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.fullName ?? ''}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        {visibleGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {groupIndex > 0 && <DropdownMenuSeparator />}

            {group.map((option) => (
              <DropdownMenuItem key={option.title} asChild className="cursor-pointer">
                <Link
                  href={option.url}
                  method={option.method ?? 'get'}
                  as={option.method === 'post' ? 'button' : 'a'}
                  className="w-full"
                >
                  <option.icon />
                  <span>{option.title}</span>
                  {option.shortcut && (
                    <DropdownMenuShortcut>{option.shortcut}</DropdownMenuShortcut>
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
