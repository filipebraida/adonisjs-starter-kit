import User from '#users/models/user'

import UserPolicy from '#users/policies/user_policy'
import TokenPolicy from '#users/policies/token_policy'

type AbilitiesReturn = Awaited<ReturnType<AbilitiesService['getAllAbilities']>>

export type Subjects = keyof AbilitiesReturn

export default class AbilitiesService {
  public async getAllAbilities(user: User) {
    return {
      users: [(await new UserPolicy().viewList(user)) && 'read'].filter(Boolean),
      token: [
        (await new TokenPolicy().create(user)) && 'create',
        (await new TokenPolicy().viewList(user)) && 'read',
      ].filter(Boolean),
    }
  }
}
