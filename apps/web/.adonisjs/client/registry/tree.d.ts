/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  durableDashboard: {
    index: typeof routes['durable_dashboard.index']
    assets: typeof routes['durable_dashboard.assets']
    runs: {
      index: typeof routes['durable_dashboard.runs.index']
      values: typeof routes['durable_dashboard.runs.values']
      show: typeof routes['durable_dashboard.runs.show']
      fans: typeof routes['durable_dashboard.runs.fans']
      retry: typeof routes['durable_dashboard.runs.retry']
      retryWithInput: typeof routes['durable_dashboard.runs.retry_with_input']
      redispatch: typeof routes['durable_dashboard.runs.redispatch']
      republishLifecycle: typeof routes['durable_dashboard.runs.republish_lifecycle']
      cancel: typeof routes['durable_dashboard.runs.cancel']
      continue: typeof routes['durable_dashboard.runs.continue']
      signal: typeof routes['durable_dashboard.runs.signal']
      update: typeof routes['durable_dashboard.runs.update']
      taskComplete: typeof routes['durable_dashboard.runs.task_complete']
      taskFail: typeof routes['durable_dashboard.runs.task_fail']
      event: typeof routes['durable_dashboard.runs.event']
      stream: typeof routes['durable_dashboard.runs.stream']
    }
    workflows: {
      lifecycle: typeof routes['durable_dashboard.workflows.lifecycle']
    }
    webhooks: {
      deliver: typeof routes['durable_dashboard.webhooks.deliver']
    }
    metrics: typeof routes['durable_dashboard.metrics']
    schedules: {
      index: typeof routes['durable_dashboard.schedules.index']
      action: typeof routes['durable_dashboard.schedules.action']
    }
    openapi: typeof routes['durable_dashboard.openapi']
    bulk: typeof routes['durable_dashboard.bulk']
    apps: typeof routes['durable_dashboard.apps']
    tenants: typeof routes['durable_dashboard.tenants'] & {
      select: typeof routes['durable_dashboard.tenants.select']
    }
    consoles: typeof routes['durable_dashboard.consoles'] & {
      search: typeof routes['durable_dashboard.consoles.search']
    }
    health: typeof routes['durable_dashboard.health']
    workers: typeof routes['durable_dashboard.workers']
    topology: typeof routes['durable_dashboard.topology']
    compat: typeof routes['durable_dashboard.compat']
  }
  health: {
    live: typeof routes['health.live']
    ready: typeof routes['health.ready']
  }
  more: typeof routes['more']
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
  roles: {
    index: typeof routes['roles.index']
    create: typeof routes['roles.create']
    store: typeof routes['roles.store']
    update: typeof routes['roles.update']
    destroy: typeof routes['roles.destroy']
  }
  users: {
    invite: {
      show: typeof routes['users.invite.show']
      handle: typeof routes['users.invite.handle']
    }
    impersonate: {
      handle: typeof routes['users.impersonate.handle']
      stop: typeof routes['users.impersonate.stop']
    }
    activity: typeof routes['users.activity']
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
  notifications: {
    index: typeof routes['notifications.index']
    markRead: typeof routes['notifications.markRead']
    markAllSeen: typeof routes['notifications.markAllSeen']
    markAllRead: typeof routes['notifications.markAllRead']
  }
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
  help: {
    index: typeof routes['help.index']
    space: typeof routes['help.space']
    image: typeof routes['help.image']
    show: typeof routes['help.show']
    content: typeof routes['help.content']
  }
}
