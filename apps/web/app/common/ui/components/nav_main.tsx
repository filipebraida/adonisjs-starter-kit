import { Link } from '@inertiajs/react'

import { type LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar'

import { Subjects, useAbility } from '#users/ui/context/abilities_context'

export interface NavMainSection {
  title: string
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    external?: boolean
    subject?: Subjects
  }[]
}

export interface NavMainProps {
  items: NavMainSection[]
}

export function NavMain({ items }: NavMainProps) {
  const abilities = useAbility()

  return (
    <>
      {items.map((item) => {
        const visibleItems = item.items.filter(
          (subItem) => !subItem.subject || abilities.can('read', subItem.subject)
        )

        if (visibleItems.length === 0) return null

        return (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton asChild tooltip={subItem.title}>
                      {subItem.url ? (
                        subItem.external ? (
                          <a href={subItem.url} target="_blank" rel="noopener noreferrer">
                            <subItem.icon />
                            <span>{subItem.title}</span>
                          </a>
                        ) : (
                          <Link href={subItem.url}>
                            <subItem.icon />
                            <span>{subItem.title}</span>
                          </Link>
                        )
                      ) : (
                        <span>
                          <subItem.icon />
                          <span>{subItem.title}</span>
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )
      })}
    </>
  )
}
