import type { MultipartFile } from '@adonisjs/core/types/bodyparser'
import { attachmentManager } from '@jrmc/adonis-attachment'

import type User from '#auth/models/user'

export interface UpdateProfileInput {
  target: User
  fullName: string
  avatar?: MultipartFile | null
}

/** Updates a user's name and, when one is sent, replaces the avatar. */
export default class UpdateProfile {
  async handle(input: UpdateProfileInput): Promise<User> {
    if (input.avatar) {
      input.target.avatar.set(await attachmentManager.createFromFile(input.avatar))
    }
    input.target.fullName = input.fullName
    await input.target.save()
    return input.target
  }
}
