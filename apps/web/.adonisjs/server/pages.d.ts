import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'analytics/dashboard': ExtractProps<(typeof import('../../app/analytics/ui/pages/dashboard.tsx'))['default']>
    'auth/forgot_password': ExtractProps<(typeof import('../../app/auth/ui/pages/forgot_password.tsx'))['default']>
    'auth/reset_password': ExtractProps<(typeof import('../../app/auth/ui/pages/reset_password.tsx'))['default']>
    'auth/sign_in': ExtractProps<(typeof import('../../app/auth/ui/pages/sign_in.tsx'))['default']>
    'auth/sign_up': ExtractProps<(typeof import('../../app/auth/ui/pages/sign_up.tsx'))['default']>
    'core/errors/not_found': ExtractProps<(typeof import('../../app/core/ui/pages/errors/not_found.tsx'))['default']>
    'core/errors/server_error': ExtractProps<(typeof import('../../app/core/ui/pages/errors/server_error.tsx'))['default']>
    'marketing/show': ExtractProps<(typeof import('../../app/marketing/ui/pages/show.tsx'))['default']>
    'users/appearance': ExtractProps<(typeof import('../../app/users/ui/pages/appearance.tsx'))['default']>
    'users/create': ExtractProps<(typeof import('../../app/users/ui/pages/create.tsx'))['default']>
    'users/edit': ExtractProps<(typeof import('../../app/users/ui/pages/edit.tsx'))['default']>
    'users/index': ExtractProps<(typeof import('../../app/users/ui/pages/index.tsx'))['default']>
    'users/invite': ExtractProps<(typeof import('../../app/users/ui/pages/invite.tsx'))['default']>
    'users/password': ExtractProps<(typeof import('../../app/users/ui/pages/password.tsx'))['default']>
    'users/profile': ExtractProps<(typeof import('../../app/users/ui/pages/profile.tsx'))['default']>
    'users/tokens': ExtractProps<(typeof import('../../app/users/ui/pages/tokens.tsx'))['default']>
    'auth/actions/sign_up': ExtractProps<(typeof import('../../app/auth/actions/sign_up.ts'))['default']>
    'auth/actions/sign_in': ExtractProps<(typeof import('../../app/auth/actions/sign_in.ts'))['default']>
    'auth/actions/request_password_reset': ExtractProps<(typeof import('../../app/auth/actions/request_password_reset.ts'))['default']>
    'auth/actions/reset_password': ExtractProps<(typeof import('../../app/auth/actions/reset_password.ts'))['default']>
    'auth/actions/authenticate_with_social': ExtractProps<(typeof import('../../app/auth/actions/authenticate_with_social.ts'))['default']>
  }
}
