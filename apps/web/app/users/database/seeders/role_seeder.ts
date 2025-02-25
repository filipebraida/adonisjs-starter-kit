import { BaseSeeder } from '@adonisjs/lucid/seeders'

import Role from '#users/models/role'
import Roles from '#users/enums/role'

export default class UserSeeder extends BaseSeeder {
  async run() {
    await Role.createMany([
      {
        id: Roles.USER,
        name: 'User',
        description: 'Authenticated User',
      },
      {
        id: Roles.ADMIN,
        name: 'Admin',
        description: 'Super User',
      },
    ])
  }
}
