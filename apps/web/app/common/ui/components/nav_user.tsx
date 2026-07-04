import React from 'react'
import { Link } from '@inertiajs/react'

import { UserAvatar } from '#common/ui/components/user_avatar'
import useCan from '#common/ui/hooks/use_can'
import type { NavUserProps } from '#common/ui/types/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

export function NavUser({ user, options }: NavUserProps) {
  const can = useCan()
  const visibleGroups = options
    .map((group) => group.filter((option) => !option.can || can[option.can]))
    .filter((group) => group.length > 0)

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
