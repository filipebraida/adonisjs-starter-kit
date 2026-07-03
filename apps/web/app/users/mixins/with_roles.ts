import { BaseModel, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'

import Role from '#users/models/role'
import type { Permission } from '#users/enums/permission'

/**
 * Adds a many-to-many `roles` relationship to a Lucid model, plus role and
 * permission helpers that read from the assigned roles.
 *
 * Under the hood it wires:
 *   - `roles: ManyToMany<typeof Role>` via the `user_roles` pivot table;
 *   - synchronous `preloadedRoles` getter for transformers / render paths;
 *   - async helpers (`getRoleNames`, `hasRole`, `getPermissions`,
 *     `hasPermission`) that auto-load the relationship when it hasn't been
 *     preloaded upstream;
 *   - imperative role assignment (`assignRole`, `assignRoles`, `syncRoles`,
 *     `revokeRole`, `revokeRoles`) delegating to Lucid's m2m client.
 *
 * The `foreignKey` argument names the pivot column pointing at the host
 * model. Defaults to `user_id`, which matches the base starter kit; pass a
 * different value if you compose the mixin into a non-user model.
 *
 * @example
 * ```ts
 * import { compose } from '@adonisjs/core/helpers'
 * import { withRoles } from '#users/mixins/with_roles'
 * import BaseModel from '#common/models/base_model'
 *
 * export default class User extends compose(BaseModel, withRoles()) {}
 * ```
 */
export function withRoles({ foreignKey = 'user_id' }: { foreignKey?: string } = {}) {
  return <Model extends NormalizeConstructor<typeof BaseModel>>(superclass: Model) => {
    class WithRoles extends superclass {
      @manyToMany(() => Role, {
        pivotTable: 'user_roles',
        pivotForeignKey: foreignKey,
        pivotRelatedForeignKey: 'role_id',
      })
      declare roles: ManyToMany<typeof Role>

      /**
       * Preloaded roles as a plain array — empty if the relationship wasn't
       * preloaded. Useful in synchronous contexts like transformers.
       */
      get preloadedRoles(): Role[] {
        const rel = this.roles as unknown
        return Array.isArray(rel) ? (rel as Role[]) : []
      }

      /** Loads roles if not already preloaded and returns them. */
      private async loadedRoles(): Promise<Role[]> {
        if (Array.isArray(this.roles as unknown)) return this.preloadedRoles
        await (this as unknown as { load: (relation: 'roles') => Promise<void> }).load('roles')
        return this.preloadedRoles
      }

      /**
       * Names of the roles held by the record. Uses the preloaded relationship
       * when available; otherwise loads it. Prefer preloading upstream to
       * avoid an N+1 in loops.
       */
      async getRoleNames(): Promise<string[]> {
        const roles = await this.loadedRoles()
        return roles.map((role) => role.name)
      }

      /** True when the record holds a role with the given name. */
      async hasRole(name: string): Promise<boolean> {
        const names = await this.getRoleNames()
        return names.includes(name)
      }

      /** Union of permissions from every assigned role, deduplicated. */
      async getPermissions(): Promise<Permission[]> {
        const roles = await this.loadedRoles()
        const merged = new Set<Permission>()
        for (const role of roles) {
          for (const permission of role.permissions) {
            merged.add(permission)
          }
        }
        return Array.from(merged)
      }

      /** True when any of the record's roles grants the given permission. */
      async hasPermission(permission: Permission): Promise<boolean> {
        const roles = await this.loadedRoles()
        return roles.some((role) => role.hasPermission(permission))
      }

      /** Attaches one role. Idempotent — a duplicate throws no error. */
      async assignRole(role: Role | number): Promise<void> {
        const id = typeof role === 'number' ? role : role.id
        await this.rolesClient().sync([id], false)
      }

      /** Attaches multiple roles at once. Existing role assignments are preserved. */
      async assignRoles(roles: (Role | number)[]): Promise<void> {
        const ids = roles.map((role) => (typeof role === 'number' ? role : role.id))
        await this.rolesClient().sync(ids, false)
      }

      /** Replaces the record's role assignments with the given set. */
      async syncRoles(roles: (Role | number)[]): Promise<void> {
        const ids = roles.map((role) => (typeof role === 'number' ? role : role.id))
        await this.rolesClient().sync(ids)
      }

      /** Detaches a role. Silent when the role isn't attached. */
      async revokeRole(role: Role | number): Promise<void> {
        const id = typeof role === 'number' ? role : role.id
        await this.rolesClient().detach([id])
      }

      /** Detaches multiple roles at once. */
      async revokeRoles(roles: (Role | number)[]): Promise<void> {
        const ids = roles.map((role) => (typeof role === 'number' ? role : role.id))
        await this.rolesClient().detach(ids)
      }

      /**
       * `this.related('roles')` narrows to the ManyToMany client, but inside
       * a mixin `this` is generic and TypeScript can't extract the relation
       * key. We cast once here and reuse from every mutation method.
       */
      private rolesClient() {
        return (
          this as unknown as {
            related: (relation: 'roles') => {
              sync: (ids: number[], detachOthers?: boolean) => Promise<void>
              detach: (ids: number[]) => Promise<void>
            }
          }
        ).related('roles')
      }
    }

    return WithRoles
  }
}
