import User from '#users/models/user'

import UserPolicy from '#users/policies/user_policy'
import TokenPolicy from '#users/policies/token_policy'

import { AuthorizerResponse } from '@adonisjs/bouncer/types'

import { type MongoQuery } from '@casl/ability'

export type Subjects = 'user' | 'token'

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'

export type Rule = {
  action: Actions
  subject: Subjects
  fields?: string[]
  conditions?: MongoQuery<Record<string, any>>
}

export default class AbilitiesService {
  private rules: Rule[] = []

  private addRuleIf(
    ok: AuthorizerResponse,
    action: Rule['action'],
    subject: Rule['subject'],
    fields?: string[]
  ) {
    if (ok) this.addRule(action, subject, fields)
  }

  private addRule(action: Rule['action'], subject: Rule['subject'], fields?: string[]) {
    this.rules.push({ action, subject, fields })
  }

  public async getAllAbilities(user: User) {
    // ----- user
    const userPolicy = new UserPolicy()
    this.addRuleIf(userPolicy.viewList(user), 'read', 'user')

    // ----- token
    const tokenPolicy = new TokenPolicy()
    this.addRuleIf(tokenPolicy.create(user), 'create', 'token')
    this.addRuleIf(tokenPolicy.viewList(user), 'read', 'token')

    return this.rules
  }
}
