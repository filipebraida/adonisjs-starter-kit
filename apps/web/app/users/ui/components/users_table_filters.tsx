import * as React from 'react'
import { router } from '@inertiajs/react'
import { useDebounceCallback } from 'usehooks-ts'

import { Check, PlusCircle, X } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@workspace/ui/components/command'
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover'
import { Separator } from '@workspace/ui/components/separator'
import { Input } from '@workspace/ui/components/input'

import { useTranslation } from '#common/ui/hooks/use_translation'
import { userRoles } from '#users/ui/components/users_types'

import type Role from '#users/dtos/role'

type Option = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

export default function UsersTableFilters({ roles }: { roles: Role[] }) {
  const { t } = useTranslation()

  const [fullName, setFullName] = React.useState('')
  const [roleIds, setRoleIds] = React.useState<string[]>([])

  const handleSubmit = React.useCallback((fullName: string, roleIds: string[]) => {
    const data = {
      fullName: fullName.length > 0 ? fullName : undefined,
      roleIds: roleIds.length > 0 ? roleIds : undefined,
    }

    router.get('/users', data, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
      only: ['users'],
    })
  }, [])

  const debouncedSearch = useDebounceCallback(handleSubmit, 300)
  React.useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch])

  const isFiltered = (fullName?.trim()?.length ?? 0) > 0 || (roleIds?.length ?? 0) > 0

  const clearAll = () => {
    setFullName('')
    setRoleIds([])
    handleSubmit('', [])
  }

  const handleSearch = (value: string) => {
    setFullName(value)
    debouncedSearch(value, roleIds)
  }

  const options: Option[] = React.useMemo(
    () =>
      roles.map((role) => ({
        value: String(role.id),
        label: role.name,
        icon: userRoles.find(({ id }) => id === role.id)?.icon,
      })),
    [roles]
  )

  const toggleRole = (val: string) => {
    setRoleIds((prev) => {
      const next = prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
      handleSubmit(fullName, next)
      return next
    })
  }

  const clearRoles = () => {
    setRoleIds([])
    handleSubmit(fullName, [])
  }

  return (
    <div className="flex items-center justify-start">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder={t('users.index.table.filters.search_placeholder')}
          value={fullName}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <PlusCircle />
              {t('users.index.table.filters.role')}
              {roleIds.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                    {roleIds.length}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {roleIds.length > 2 ? (
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {roleIds.length} {t('users.index.table.filters.nb_selectd')}
                      </Badge>
                    ) : (
                      options
                        .filter((o) => roleIds.includes(o.value))
                        .map((o) => (
                          <Badge
                            key={o.value}
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                          >
                            {o.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[240px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t('users.index.table.filters.role')} />
              <CommandList>
                <CommandEmpty>{t('users.index.table.filters.no_results')}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = roleIds.includes(option.value)
                    return (
                      <CommandItem key={option.value} onSelect={() => toggleRole(option.value)}>
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <Check />
                        </div>
                        {option.icon && (
                          <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{option.label}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>

                {roleIds.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem onSelect={clearRoles} className="justify-center text-center">
                        {t('users.index.table.filters.clear_filters')}
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {isFiltered && (
        <Button variant="ghost" onClick={clearAll} className="h-8 px-2 lg:px-3">
          {t('users.index.table.row_actions.clear')}
          <X />
        </Button>
      )}
    </div>
  )
}
