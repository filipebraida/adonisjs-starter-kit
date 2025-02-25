import React from 'react'
import { PureAbility, AbilityBuilder } from '@casl/ability'

import usePageProps from '#common/ui/hooks/use_page_props'

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'
export type Subjects = 'users' | 'all'
export type AppAbility = PureAbility<[Actions, Subjects]>

interface AbilityContextType {
  ability: AppAbility
}

const AbilityContext = React.createContext<AbilityContextType | null>(null)

interface AbilitiesProviderProps {
  children: React.ReactNode
}

function defineAbilityFor(roles: Record<string, string[]>): AppAbility {
  const { can, rules } = new AbilityBuilder<PureAbility<[Actions, Subjects]>>(PureAbility)

  for (const [subject, permissions] of Object.entries(roles)) {
    if (Array.isArray(permissions)) {
      for (const action of permissions) {
        can(action as Actions, subject as Subjects)
      }
    }
  }

  return new PureAbility<[Actions, Subjects]>(rules)
}

export default function AbilityProvider({ children }: AbilitiesProviderProps) {
  const { abilities } = usePageProps<{ abilities: Record<string, string[]> }>()
  const ability = defineAbilityFor(abilities)

  return <AbilityContext.Provider value={{ ability }}>{children}</AbilityContext.Provider>
}

export const useAbility = () => {
  const abilityContext = React.useContext(AbilityContext)

  if (!abilityContext) {
    throw new Error('useAbility must be used within <AbilityProvider>')
  }

  return abilityContext.ability
}
