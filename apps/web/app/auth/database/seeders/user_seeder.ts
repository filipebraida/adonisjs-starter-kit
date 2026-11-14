import { BaseSeeder } from '@adonisjs/lucid/seeders'

import User from '#auth/models/user'

import { ROLES } from '#auth/enums/role'

export default class UserSeeder extends BaseSeeder {
  async run() {
    const admin = await User.updateOrCreate(
      { email: 'admin@repo.com' },
      { fullName: 'Administrator', password: '123' }
    )

    // What `admin` grants comes from config/capabilities.ts; only the assignment is stored.
    await admin.assignRole(ROLES.ADMIN)
  }
}
