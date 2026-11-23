import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/core/encryption'

const encryptionConfig = defineConfig({
  default: 'gcm',
  list: {
    gcm: drivers.aes256gcm({
      keys: [env.get('APP_KEY').release()],
      id: 'gcm',
    }),
  },
})

export default encryptionConfig

declare module '@adonisjs/core/types' {
  export interface EncryptorsList extends InferEncryptors<typeof encryptionConfig> {}
}
