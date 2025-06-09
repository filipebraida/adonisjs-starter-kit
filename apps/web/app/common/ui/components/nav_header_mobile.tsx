import { Link } from '@inertiajs/react'
import { Menu } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetHeader,
} from '@workspace/ui/components/sheet'

import { AppLogo } from '#common/ui/components/app_logo'
import { isSection, type NavMainItem } from '#common/ui/types/navigation'
import { useAbility } from '#users/ui/context/abilities_context'

const sidebarMenuButtonVariants =
  'text-sidebar-foreground flex w-full items-center gap-2 overflow-hidden ' +
  'rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] ' +
  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ' +
  'focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent ' +
  'data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground ' +
  'data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground ' +
  '[&>span:last-child]:truncate [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0'

export interface NavHeaderMobileProps {
  items: NavMainItem[]
}

export function NavHeaderMobile({ items }: NavHeaderMobileProps) {
  const abilities = useAbility()

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="flex h-full w-72 flex-col items-stretch justify-between bg-sidebar px-1"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          <SheetHeader className="flex justify-start px-3 text-left">
            <AppLogo />
          </SheetHeader>

          <div className="mt-2 flex h-full flex-1 flex-col space-y-4 px-2">
            <div className="flex flex-col space-y-8 text-sm">
              {items.map((item, index) => {
                if (isSection(item)) {
                  const visibleItems = item.items.filter(
                    (subItem) => !subItem.subject || abilities.can('read', subItem.subject)
                  )
                  if (visibleItems.length === 0) return null

                  return (
                    <div key={index}>
                      <h3 className="mb-1 px-2 text-xs font-medium text-sidebar-foreground/70">
                        {item.title}
                      </h3>

                      <div className="flex flex-col space-y-1">
                        {visibleItems.map((subItem, subIndex) => {
                          if (subItem.external) {
                            return (
                              <a
                                key={subIndex}
                                href={subItem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={sidebarMenuButtonVariants}
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
                                className={sidebarMenuButtonVariants}
                              >
                                {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                                <span>{subItem.title}</span>
                              </Link>
                            )
                          }
                        })}
                      </div>
                    </div>
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
                          className={sidebarMenuButtonVariants}
                        >
                          {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                          <span>{item.title}</span>
                        </a>
                      )
                    } else {
                      return (
                        <Link key={index} href={item.url} className={sidebarMenuButtonVariants}>
                          {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                          <span>{item.title}</span>
                        </Link>
                      )
                    }
                  }
                  return null
                }
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
