import { isStructuralRole } from '#auth/enums/role'
import {
  capabilitiesOfRoles,
  capabilityVocabulary,
  existingRoles,
  membersPerRole,
} from '#auth/queries/roles_query'

export type RoleInMatrix = {
  name: string
  /** Defined in code: the page shows it and does not edit it. */
  structural: boolean
  capabilities: string[]
  members: number
}

export type RolesMatrixResult = {
  roles: RoleInMatrix[]
  /** Every capability an institutional role may be given. */
  vocabulary: string[]
}

/**
 * The roles page: which roles exist, what each grants and how many users hold
 * it. Roles defined in code come first, then the institutional ones by name.
 */
export default class RolesMatrix {
  async handle(): Promise<RolesMatrixResult> {
    const names = await existingRoles()
    const [capabilities, members] = await Promise.all([
      capabilitiesOfRoles(names),
      membersPerRole(names),
    ])

    return {
      roles: names.map((name) => ({
        name,
        structural: isStructuralRole(name),
        capabilities: capabilities[name],
        members: members[name],
      })),
      vocabulary: capabilityVocabulary(),
    }
  }
}
