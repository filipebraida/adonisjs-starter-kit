import Factory from '@adonisjs/lucid/factories'

import User from '#users/models/user'

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    fullName: faker.internet.username(),
    // Match the validators (which lowercase); otherwise factory users fail login lookups.
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
  }
}).build()
