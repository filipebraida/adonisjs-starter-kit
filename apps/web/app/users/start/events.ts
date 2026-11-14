import emitter from '@adonisjs/core/services/emitter'

emitter.on('user:registered', [() => import('#users/listeners/send_welcome')])
