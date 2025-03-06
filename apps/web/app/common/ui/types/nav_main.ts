import { Subjects } from '#users/ui/context/abilities_context'

import { LucideIcon } from 'lucide-react'

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
