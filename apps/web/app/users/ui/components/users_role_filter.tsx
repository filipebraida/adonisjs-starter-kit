import * as React from 'react'

import { Check, PlusCircle } from 'lucide-react'
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

type Option = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

type UsersRoleFilterProps = {
  title: string
  value: string[]
  onChange: (next: string[]) => void
  options: Option[]
  t: (key: string, opts?: Record<string, unknown>) => string
  counts?: Record<string, number>
  className?: string
}

export default function UsersRoleFilter({
  title,
  value,
  onChange,
  options,
  t,
  counts,
  className,
}: UsersRoleFilterProps) {
  const selectedCount = value.length

  const toggle = (val: string) => {
    const next = value.includes(val) ? value.filter((v) => v !== val) : [...value, val]
    onChange(next)
  }

  const clear = () => onChange([])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('h-8 border-dashed', className)}>
          <PlusCircle />
          {title}
          {selectedCount > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedCount}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedCount > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedCount} {t('users.index.table.filters.nb_selectd')}
                  </Badge>
                ) : (
                  options
                    .filter((o) => value.includes(o.value))
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
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>{t('users.index.table.filters.no_results')}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value)
                return (
                  <CommandItem key={option.value} onSelect={() => toggle(option.value)}>
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
                    {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{option.label}</span>
                    {!!counts?.[option.value] && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {counts[option.value]}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {selectedCount > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={clear} className="justify-center text-center">
                    {t('users.index.table.filters.clear_filters')}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
