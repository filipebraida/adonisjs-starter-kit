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
  /** A number to call for attention (unread, waiting), shown as a badge. */
  count?: number
}

interface NavMainSection {
  title: string
  items: ItemNav[]
}

export type NavMainItem = NavMainSection | ItemNav

/** Which shell a page is in: the app's own, or the administration. */
export type ShellArea = 'app' | 'admin'

export type TabItem = ItemNav & { icon: LucideIcon }

export interface MoreGroup {
  title: string
  items: (ItemNav & { method?: 'get' | 'post' })[]
}

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
  /** The user's role, shown under the name. */
  role: string | null
  options: NavUserOptionsGroup[]
}
