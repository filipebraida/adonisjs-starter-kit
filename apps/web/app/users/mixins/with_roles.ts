import { BaseModel, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'

import Role from '#users/models/role'
import type { Permission } from '#users/enums/permission'

export function withRoles({ foreignKey = 'user_id' }: { foreignKey?: string } = {}) {
  return <Model extends NormalizeConstructor<typeof BaseModel>>(superclass: Model) => {
    class WithRoles extends superclass {
      @manyToMany(() => Role, {
        pivotTable: 'user_roles',
        pivotForeignKey: foreignKey,
        pivotRelatedForeignKey: 'role_id',
      })
      declare roles: ManyToMany<typeof Role>

      get preloadedRoles(): Role[] {
        const rel = this.roles as unknown
        return Array.isArray(rel) ? (rel as Role[]) : []
      }

      private async loadedRoles(): Promise<Role[]> {
        if (Array.isArray(this.roles as unknown)) return this.preloadedRoles
        await (this as unknown as { load: (relation: 'roles') => Promise<void> }).load('roles')
        return this.preloadedRoles
      }

      async getRoleNames(): Promise<string[]> {
        const roles = await this.loadedRoles()
        return roles.map((role) => role.name)
      }

      async hasRole(name: string): Promise<boolean> {
        const names = await this.getRoleNames()
        return names.includes(name)
      }

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

      async hasPermission(permission: Permission): Promise<boolean> {
        const roles = await this.loadedRoles()
        return roles.some((role) => role.hasPermission(permission))
      }

      async assignRole(role: Role | number): Promise<void> {
        const id = typeof role === 'number' ? role : role.id
        await this.rolesClient().sync([id], false)
      }

      async assignRoles(roles: (Role | number)[]): Promise<void> {
        const ids = roles.map((role) => (typeof role === 'number' ? role : role.id))
        await this.rolesClient().sync(ids, false)
      }

      async syncRoles(roles: (Role | number)[]): Promise<void> {
        const ids = roles.map((role) => (typeof role === 'number' ? role : role.id))
        await this.rolesClient().sync(ids)
      }

      async revokeRole(role: Role | number): Promise<void> {
        const id = typeof role === 'number' ? role : role.id
        await this.rolesClient().detach([id])
      }

      async revokeRoles(roles: (Role | number)[]): Promise<void> {
        const ids = roles.map((role) => (typeof role === 'number' ? role : role.id))
        await this.rolesClient().detach(ids)
      }

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
