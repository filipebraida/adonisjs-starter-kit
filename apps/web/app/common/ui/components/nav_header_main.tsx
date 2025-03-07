import { Link } from '@inertiajs/react'

import { isSection, NavMainItem } from '#common/ui/types/nav_main'
import { useAbility } from '#users/ui/context/abilities_context'

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@workspace/ui/components/navigation-menu'
import { cn } from '@workspace/ui/lib/utils'

export interface NavHeaderMainProps {
  items: NavMainItem[]
}

export function NavHeaderMain({ items }: NavHeaderMainProps) {
  const abilities = useAbility()

  return (
    <NavigationMenu className="flex h-full items-stretch">
      <NavigationMenuList className="flex h-full items-stretch space-x-2">
        {items.map((item, index) => {
          if (isSection(item)) {
            const visibleItems = item.items.filter(
              (subItem) => !subItem.subject || abilities.can('read', subItem.subject)
            )

            if (visibleItems.length === 0) return null

            return (
              <NavigationMenuItem key={index} className="relative flex h-full items-center">
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>

                <NavigationMenuContent>
                  <ul className="grid gap-3 p-3 w-[400px]">
                    {visibleItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={subItem.url}
                            className="flex items-center space-x-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                            <div className="text-sm font-medium leading-none">{subItem.title}</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          } else {
            if (!item.subject || abilities.can('read', item.subject)) {
              return (
                <NavigationMenuItem key={index} className="relative flex h-full items-center">
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'flex items-center space-x-2 gap-2'
                      )}
                    >
                      {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            } else {
              return null
            }
          }
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
