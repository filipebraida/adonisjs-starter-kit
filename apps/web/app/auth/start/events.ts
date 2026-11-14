import emitter from '@adonisjs/core/services/emitter'

emitter.on('auth:forgot_password', [() => import('#auth/listeners/send_password_reset')])
