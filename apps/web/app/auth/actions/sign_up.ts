import User from '#auth/models/user'

export interface SignUpInput {
  fullName: string
  email: string
  password: string
  locale: string
}

/** Signs a visitor up: creates the account with the locale they browsed in. */
export default class SignUp {
  async handle(input: SignUpInput): Promise<User> {
    return User.create({
      fullName: input.fullName,
      email: input.email,
      password: input.password,
      locale: input.locale,
    })
  }
}
