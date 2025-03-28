import { Link } from '@inertiajs/react'

import { isSection, NavMainItem } from '#common/ui/types/nav_main'
import HeaderDropdown from '#common/ui/components/header_dropdown'
import { useAbility } from '#users/ui/context/abilities_context'

export interface NavHeaderMainProps {
  items: NavMainItem[]
}

export function NavHeaderMain({ items }: NavHeaderMainProps) {
  const abilities = useAbility()

  return (
    <nav className="flex items-center space-x-4">
      {items.map((item, index) => {
        if (isSection(item)) {
          const visibleItems = item.items.filter(
            (subItem) => !subItem.subject || abilities.can('read', subItem.subject)
          )

          if (visibleItems.length === 0) {
            return null
          }
          return (
            <HeaderDropdown
              key={index}
              trigger={<div className="flex items-center">{item.title}</div>}
              width={visibleItems.length > 5 ? 'w-[220px]' : 'w-[180px]'}
              content={
                <div className="grid gap-1 p-2">
                  {visibleItems.map((subItem, subIndex) => {
                    if (subItem.external) {
                      return (
                        <a
                          key={subIndex}
                          href={subItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex select-none items-center space-x-2 rounded-md px-2 py-1.5 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                          <span>{subItem.title}</span>
                        </a>
                      )
                    } else {
                      return (
                        <Link
                          key={subIndex}
                          href={subItem.url}
                          className="flex select-none items-center space-x-2 rounded-md px-2 py-1.5 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                          <span>{subItem.title}</span>
                        </Link>
                      )
                    }
                  })}
                </div>
              }
            />
          )
        } else {
          if (!item.subject || abilities.can('read', item.subject)) {
            if (item.external) {
              return (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4 shrink-0" />}
                  {item.title}
                </a>
              )
            } else {
              return (
                <Link
                  key={index}
                  href={item.url}
                  className="flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4 shrink-0" />}
                  {item.title}
                </Link>
              )
            }
          } else {
            return null
          }
        }
      })}
    </nav>
  )
}
