import limiter from '@adonisjs/limiter/services/main'

/**
 * The sign-in rate limit: five failed attempts per IP and e-mail lock the pair
 * out for a minute. Sign-in counts the attempts and a password reset clears
 * them, so both must use this one definition and key.
 */
export default class LoginLimiter {
  readonly limiter = limiter.use({ requests: 5, duration: '1 min', blockDuration: '1 min' })

  key(ip: string, email: string) {
    return `login_${ip}_${email}`
  }

  clear(ip: string, email: string) {
    return this.limiter.delete(this.key(ip, email))
  }
}
