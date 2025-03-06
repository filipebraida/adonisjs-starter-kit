import { Link } from '@inertiajs/react'

import { isSection, NavMainItem } from '#common/ui/types/nav_main'
import { AppLogo } from '#common/ui/components/app_logo'
import { useAbility } from '#users/ui/context/abilities_context'

import { Menu } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetHeader,
} from '@workspace/ui/components/sheet'

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
          className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          <SheetHeader className="flex justify-start text-left">
            <AppLogo />
          </SheetHeader>

          <div className="mt-6 flex h-full flex-1 flex-col space-y-4">
            <div className="flex flex-col space-y-4 text-sm">
              {items.map((item, index) => {
                if (isSection(item)) {
                  const visibleItems = item.items.filter(
                    (subItem) => !subItem.subject || abilities.can('read', subItem.subject)
                  )
                  if (visibleItems.length === 0) return null

                  return (
                    <div key={index}>
                      <h3 className="mb-1 font-semibold uppercase text-gray-600">{item.title}</h3>

                      <div className="flex flex-col space-y-1">
                        {visibleItems.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.url}
                            className="
                              flex items-center space-x-2 px-2 py-2
                              rounded-md font-medium
                              hover:bg-accent hover:text-accent-foreground
                              transition-colors
                            "
                          >
                            {subItem.icon && <subItem.icon className="h-5 w-5 shrink-0" />}
                            <span>{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                } else {
                  if (!item.subject || abilities.can('read', item.subject)) {
                    return (
                      <Link
                        key={index}
                        href={item.url}
                        className="
                          flex items-center space-x-2 px-2 py-2
                          rounded-md font-medium
                          hover:bg-accent hover:text-accent-foreground
                          transition-colors
                        "
                      >
                        {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                        <span>{item.title}</span>
                      </Link>
                    )
                  } else {
                    return null
                  }
                }
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
