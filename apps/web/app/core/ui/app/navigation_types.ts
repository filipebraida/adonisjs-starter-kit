import { type LucideIcon } from 'lucide-react'

import type { Capability } from '#core/authz/capability'
import type { Data } from '@generated/data'

interface ItemNav {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  external?: boolean
  can?: Capability
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
  can?: Capability
}[]

export interface NavUserProps {
  user: Data.Users.User.Variants['forSharedProps']
  options: NavUserOptionsGroup[]
}
