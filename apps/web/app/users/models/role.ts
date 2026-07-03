import { DateTime } from 'luxon'
import { column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

import BaseModel from '#common/models/base_model'
import User from '#users/models/user'

import { isPermission, type Permission } from '#users/enums/permission'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column({
    prepare: (value: Permission[]) => JSON.stringify(value ?? []),
    consume: (value: string | Permission[] | null) => {
      if (Array.isArray(value)) return value.filter(isPermission)
      if (!value) return []
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed.filter(isPermission) : []
      } catch {
        return []
      }
    },
  })
  declare permissions: Permission[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'user_roles',
    pivotForeignKey: 'role_id',
    pivotRelatedForeignKey: 'user_id',
  })
  declare users: ManyToMany<typeof User>

  /** True when this role grants the given permission. */
  hasPermission(permission: Permission): boolean {
    return this.permissions.includes(permission)
  }

  /** Adds permissions (idempotent — duplicates are dropped). Persists immediately. */
  async givePermissions(permissions: Permission[]): Promise<void> {
    const merged = new Set<Permission>([...this.permissions, ...permissions])
    this.permissions = Array.from(merged)
    await this.save()
  }

  /** Replaces the permission set. Persists immediately. */
  async syncPermissions(permissions: Permission[]): Promise<void> {
    this.permissions = Array.from(new Set(permissions))
    await this.save()
  }

  /** Removes the given permissions. Persists immediately. */
  async revokePermissions(permissions: Permission[]): Promise<void> {
    const toRemove = new Set<string>(permissions)
    this.permissions = this.permissions.filter((permission) => !toRemove.has(permission))
    await this.save()
  }
}
