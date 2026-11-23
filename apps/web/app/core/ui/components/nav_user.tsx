import React from 'react'
import { Link } from '@inertiajs/react'
import { Monitor, Moon, Sun } from 'lucide-react'

import { UserAvatar } from '#core/ui/components/user_avatar'
import useAllows from '#core/ui/hooks/use_allows'
import { useTranslation } from '#core/ui/hooks/use_translation'
import type { NavUserProps } from '#core/ui/app/navigation_types'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Segmented } from '@workspace/ui/components/segmented'
import { useTheme } from '@workspace/ui/components/theme-provider'

const THEMES = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
] as const

export function NavUser({ user, role, options }: NavUserProps) {
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
              {role && <span className="truncate text-xs">{role}</span>}
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <ThemeRow />
        <DropdownMenuSeparator />
        {visibleGroups.map((group, groupIndex) => (
          <React.Fragment key={group.map((option) => option.title).join('|')}>
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

/** The theme, switched without closing the menu: segments, not menu items. */
function ThemeRow() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const label = t('core.layout.navUser.theme.label')

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1 text-sm">
      <span>{label}</span>
      <Segmented
        label={label}
        options={THEMES.map(({ value, icon: Icon }) => ({
          value,
          title: t(`core.layout.navUser.theme.${value}`),
          label: <Icon aria-hidden />,
        }))}
        value={theme}
        onValueChange={setTheme}
      />
    </div>
  )
}
