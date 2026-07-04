import env from '#start/env'

/**
 * Shared context every email template gets. The MJML layout (`email.layout`)
 * reads `appName` and `appUrl` from here; spread this into `htmlView` props
 * from any mail class.
 */
export function mailContext() {
  return {
    appName: env.get('APP_NAME') ?? 'AdonisJS Starter Kit',
    appUrl: env.get('APP_URL'),
  }
}
