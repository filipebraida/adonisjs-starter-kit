/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  marketing: {
    show: typeof routes['marketing.show']
  }
  auth: {
    signIn: {
      show: typeof routes['auth.sign_in.show']
      handle: typeof routes['auth.sign_in.handle']
    }
    signOut: {
      handle: typeof routes['auth.sign_out.handle']
    }
    signUp: {
      show: typeof routes['auth.sign_up.show']
      handle: typeof routes['auth.sign_up.handle']
    }
    forgotPassword: {
      show: typeof routes['auth.forgot_password.show']
      handle: typeof routes['auth.forgot_password.handle']
    }
    resetPassword: {
      show: typeof routes['auth.reset_password.show']
      handle: typeof routes['auth.reset_password.handle']
    }
  }
  social: {
    create: typeof routes['social.create']
    callback: typeof routes['social.callback']
  }
  locale: {
    switch: typeof routes['locale.switch']
  }
  notifications: {
    index: typeof routes['notifications.index']
    markRead: typeof routes['notifications.markRead']
    markAllSeen: typeof routes['notifications.markAllSeen']
    markAllRead: typeof routes['notifications.markAllRead']
  }
  users: {
    invite: {
      show: typeof routes['users.invite.show']
      handle: typeof routes['users.invite.handle']
    }
    impersonate: {
      handle: typeof routes['users.impersonate.handle']
    }
    index: typeof routes['users.index']
    create: typeof routes['users.create']
    store: typeof routes['users.store']
    edit: typeof routes['users.edit']
    update: typeof routes['users.update']
    destroy: typeof routes['users.destroy']
  }
  settings: {
    index: typeof routes['settings.index']
  }
  profile: {
    update: typeof routes['profile.update']
  }
  password: {
    update: typeof routes['password.update']
  }
  tokens: {
    destroy: typeof routes['tokens.destroy']
    store: typeof routes['tokens.store']
  }
  dashboard: {
    show: typeof routes['dashboard.show']
  }
}
