import { type Subjects } from '#users/ui/context/abilities_context'

import { type LucideIcon } from 'lucide-react'

import type { Data } from '@generated/data'

interface ItemNav {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  external?: boolean
  subject?: Subjects
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
  user: Data.Users.User
  options: NavUserOptionsGroup[]
}
