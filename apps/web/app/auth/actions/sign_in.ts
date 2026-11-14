import User from '#auth/models/user'

export interface SignInInput {
  email: string
  password: string
}

/**
 * Signs a user in by email and password.
 * @throws E_INVALID_CREDENTIALS if no account matches.
 */
export default class SignIn {
  async handle(input: SignInInput): Promise<User> {
    return User.verifyCredentials(input.email, input.password)
  }
}
