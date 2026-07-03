import { Link } from '@inertiajs/react'

import { cn } from '@workspace/ui/lib/utils'

import { isSection, type NavMainItem } from '#common/ui/types/navigation'
import HeaderDropdown from '#common/ui/components/header_dropdown'
import useCan from '#common/ui/hooks/use_can'
import useCurrentUrl, { isNavItemActive } from '#common/ui/hooks/use_is_active'

export interface NavHeaderMainProps {
  items: NavMainItem[]
}

const linkBase =
  'flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
const linkActive = 'bg-accent text-accent-foreground'

const subLinkBase =
  'flex select-none items-center space-x-2 rounded-md px-2 py-1.5 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
const subLinkActive = 'bg-accent text-accent-foreground font-medium'

export function NavHeaderMain({ items }: NavHeaderMainProps) {
  const can = useCan()
  const currentUrl = useCurrentUrl()

  return (
    <nav className="flex items-center space-x-4">
      {items.map((item, index) => {
        if (isSection(item)) {
          const visibleItems = item.items.filter((subItem) => !subItem.can || can[subItem.can])

          if (visibleItems.length === 0) {
            return null
          }

          const sectionHasActive = visibleItems.some((subItem) =>
            isNavItemActive(subItem.url, currentUrl)
          )

          return (
            <HeaderDropdown
              key={index}
              trigger={
                <div
                  className={cn(
                    'flex items-center rounded-md px-3 py-1.5 text-sm font-medium',
                    sectionHasActive && 'bg-accent/60 text-accent-foreground'
                  )}
                >
                  {item.title}
                </div>
              }
              width={visibleItems.length > 5 ? 'w-[220px]' : 'w-[180px]'}
              content={
                <div className="grid gap-1 p-2">
                  {visibleItems.map((subItem, subIndex) => {
                    const active = isNavItemActive(subItem.url, currentUrl)
                    if (subItem.external) {
                      return (
                        <a
                          key={subIndex}
                          href={subItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={subLinkBase}
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                          <span>{subItem.title}</span>
                        </a>
                      )
                    }
                    return (
                      <Link
                        key={subIndex}
                        href={subItem.url}
                        className={cn(subLinkBase, active && subLinkActive)}
                      >
                        {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                        <span>{subItem.title}</span>
                      </Link>
                    )
                  })}
                </div>
              }
            />
          )
        }

        if (item.can && !can[item.can]) return null

        const active = isNavItemActive(item.url, currentUrl)

        if (item.external) {
          return (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={linkBase}
            >
              {item.icon && <item.icon className="mr-2 h-4 w-4 shrink-0" />}
              {item.title}
            </a>
          )
        }
        return (
          <Link key={index} href={item.url} className={cn(linkBase, active && linkActive)}>
            {item.icon && <item.icon className="mr-2 h-4 w-4 shrink-0" />}
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
