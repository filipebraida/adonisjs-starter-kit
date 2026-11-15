import 'i18next'

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: {
        analytics: typeof import('../../app/analytics/resources/lang/en/analytics.json')
        auth: typeof import('../../app/auth/resources/lang/en/auth.json')
        errors: typeof import('../../app/auth/resources/lang/en/errors.json')
        core: typeof import('../../app/core/resources/lang/en/core.json')
        marketing: typeof import('../../app/marketing/resources/lang/en/marketing.json')
        users: typeof import('../../app/users/resources/lang/en/users.json')
        validator: typeof import('../../app/users/resources/lang/en/validator.json')
      }
    }
  }
}
