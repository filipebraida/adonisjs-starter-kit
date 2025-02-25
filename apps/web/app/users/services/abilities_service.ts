import User from '#users/models/user'

import UserPolicy from '#users/policies/user_policy'

export default class AbilitiesService {
  public async getAllAbilities(user: User) {
    return {
      users: [(await new UserPolicy().viewList(user)) && 'read'].filter(Boolean),
    }
  }
}
