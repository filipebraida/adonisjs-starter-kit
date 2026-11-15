import authz from '@adonis-agora/authz/services/main'

import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { isStructuralRole } from '#auth/enums/role'
import StructuralRoleException from '#auth/exceptions/structural_role_exception'
import type User from '#auth/models/user'

export interface CreateRoleInput {
  name: string
  executor: User
}

/**
 * Creates an institutional role with no capability: they are ticked on the
 * roles page. Creating one that exists is not an error. A role has no
 * auditable model, so the trail sits on the executor with the role in metadata.
 * @throws StructuralRoleException if the name is a role defined in code.
 */
export default class CreateRole {
  async handle({ name, executor }: CreateRoleInput): Promise<void> {
    // A stored row named like a code role would add its grants to the code ones.
    if (isStructuralRole(name)) throw new StructuralRoleException()

    await authz.store.createRole(name)

    await executor.auditCustom(AUDIT_EVENTS.ROLE_CREATED, { metadata: { role: name } })
  }
}
