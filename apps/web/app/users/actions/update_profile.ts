import type { MultipartFile } from '@adonisjs/core/types/bodyparser'
import { attachmentManager } from '@jrmc/adonis-attachment'

import type User from '#users/models/user'

export interface UpdateProfileInput {
  target: User
  fullName: string
  avatar?: MultipartFile | null
}

export default class UpdateProfile {
  async handle(input: UpdateProfileInput): Promise<User> {
    if (input.avatar) {
      input.target.avatar = await attachmentManager.createFromFile(input.avatar)
    }
    input.target.fullName = input.fullName
    await input.target.save()
    return input.target
  }
}
