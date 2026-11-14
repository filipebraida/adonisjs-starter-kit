import User from '#auth/models/user'

export interface SignInInput {
  email: string
  password: string
}

export default class SignIn {
  async handle(input: SignInInput): Promise<User> {
    return User.verifyCredentials(input.email, input.password)
  }
}
