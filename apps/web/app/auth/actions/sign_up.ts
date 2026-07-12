import User from '#users/models/user'

export interface SignUpInput {
  fullName: string
  email: string
  password: string
  locale: string
}

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
