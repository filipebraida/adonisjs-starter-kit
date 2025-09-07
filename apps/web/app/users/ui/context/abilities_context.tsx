import React from 'react'
import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
  type MongoQuery,
} from '@casl/ability'

import usePageProps from '#common/ui/hooks/use_page_props'
import type { Rule, Subjects } from '#users/services/abilities_service'

type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'
export type { Subjects, Actions }

const adminSubjects: Subjects[] = ['token']

export function hasAdminAccess(): boolean {
  const ability = useAbility()

  return adminSubjects.some((subject) => ability.can('read', subject))
}

type PossibleAbilities = [Actions, Subjects]
type Conditions = MongoQuery<Record<string, any>>

type AppAbility = MongoAbility<PossibleAbilities, Conditions>

interface AbilityContextType {
  ability: AppAbility
}

const AbilityContext = React.createContext<AbilityContextType | null>(null)

interface AbilitiesProviderProps {
  children: React.ReactNode
}

function defineAbilityFor(roles: Rule[]): AppAbility {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility)

  for (const { action, subject, fields, conditions } of roles) {
    if (fields?.length && conditions) can(action, subject, fields, conditions)
    else if (fields?.length) can(action, subject, fields)
    else if (conditions) can(action, subject, conditions)
    else can(action, subject)
  }

  return createMongoAbility<PossibleAbilities, Conditions>(rules)
}

export default function AbilityProvider({ children }: AbilitiesProviderProps) {
  const { abilities } = usePageProps<{ abilities: Rule[] }>()

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
