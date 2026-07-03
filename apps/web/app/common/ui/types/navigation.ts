import { type LucideIcon } from 'lucide-react'

import type { GlobalPermissions } from '#users/services/global_permissions'
import type { Data } from '@generated/data'

export type CanKey = keyof GlobalPermissions

interface ItemNav {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  external?: boolean
  can?: CanKey
}

interface NavMainSection {
  title: string
  items: ItemNav[]
}

export type NavMainItem = NavMainSection | ItemNav

export function isSection(item: NavMainSection | ItemNav): item is NavMainSection {
  return 'items' in item
}

export interface NavMainProps {
  items: NavMainItem[]
}

export type NavUserOptionsGroup = {
  title: string
  url: string
  icon: LucideIcon
  shortcut?: string
  method?: 'get' | 'post'
}[]

export interface NavUserProps {
  user: Data.Users.User.Variants['forSharedProps']
  options: NavUserOptionsGroup[]
}
