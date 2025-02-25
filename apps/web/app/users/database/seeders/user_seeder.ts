import { BaseSeeder } from '@adonisjs/lucid/seeders'

import User from '#users/models/user'
import Roles from '#users/enums/role'

export default class UserSeeder extends BaseSeeder {
  async run() {
    const uniqueKey = 'email'

    await User.updateOrCreateMany(uniqueKey, [
      {
        email: 'admin@repo.com',
        fullName: 'Administrador',
        password: '123',
        roleId: Roles.ADMIN,
      },
    ])
  }
}
