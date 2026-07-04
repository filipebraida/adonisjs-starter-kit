import Factory from '@adonisjs/lucid/factories'

import User from '#users/models/user'

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    fullName: faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
}).build()
