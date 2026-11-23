import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'health.live': { paramsTuple?: []; params?: {} }
    'health.ready': { paramsTuple?: []; params?: {} }
    'marketing.show': { paramsTuple?: []; params?: {} }
    'auth.sign_in.show': { paramsTuple?: []; params?: {} }
    'auth.sign_in.handle': { paramsTuple?: []; params?: {} }
    'auth.sign_out.handle': { paramsTuple?: []; params?: {} }
    'auth.sign_up.show': { paramsTuple?: []; params?: {} }
    'auth.sign_up.handle': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.show': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.handle': { paramsTuple?: []; params?: {} }
    'auth.reset_password.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.reset_password.handle': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'social.create': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'locale.switch': { paramsTuple: [ParamValue]; params: {'locale': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'roles.create': { paramsTuple?: []; params?: {} }
    'roles.store': { paramsTuple?: []; params?: {} }
    'roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.invite.show': { paramsTuple?: []; params?: {} }
    'users.invite.handle': { paramsTuple?: []; params?: {} }
    'users.impersonate.handle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.impersonate.stop': { paramsTuple?: []; params?: {} }
    'users.activity': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.create': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'users.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'password.update': { paramsTuple?: []; params?: {} }
    'tokens.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tokens.store': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.markRead': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.markAllSeen': { paramsTuple?: []; params?: {} }
    'notifications.markAllRead': { paramsTuple?: []; params?: {} }
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'help.index': { paramsTuple?: []; params?: {} }
    'help.space': { paramsTuple: [ParamValue]; params: {'space': ParamValue} }
    'help.image': { paramsTuple: [ParamValue,ParamValue]; params: {'space': ParamValue,'file': ParamValue} }
    'help.show': { paramsTuple: [ParamValue,ParamValue]; params: {'space': ParamValue,'article': ParamValue} }
    'help.content': { paramsTuple: [ParamValue,ParamValue]; params: {'space': ParamValue,'article': ParamValue} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'health.live': { paramsTuple?: []; params?: {} }
    'health.ready': { paramsTuple?: []; params?: {} }
    'marketing.show': { paramsTuple?: []; params?: {} }
    'auth.sign_in.show': { paramsTuple?: []; params?: {} }
    'auth.sign_up.show': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.show': { paramsTuple?: []; params?: {} }
    'auth.reset_password.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'social.create': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'roles.create': { paramsTuple?: []; params?: {} }
    'users.invite.show': { paramsTuple?: []; params?: {} }
    'users.activity': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.create': { paramsTuple?: []; params?: {} }
    'users.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'event_stream': { paramsTuple?: []; params?: {} }
    'help.index': { paramsTuple?: []; params?: {} }
    'help.space': { paramsTuple: [ParamValue]; params: {'space': ParamValue} }
    'help.image': { paramsTuple: [ParamValue,ParamValue]; params: {'space': ParamValue,'file': ParamValue} }
    'help.show': { paramsTuple: [ParamValue,ParamValue]; params: {'space': ParamValue,'article': ParamValue} }
    'help.content': { paramsTuple: [ParamValue,ParamValue]; params: {'space': ParamValue,'article': ParamValue} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'health.live': { paramsTuple?: []; params?: {} }
    'health.ready': { paramsTuple?: []; params?: {} }
    'marketing.show': { paramsTuple?: []; params?: {} }
    'auth.sign_in.show': { paramsTuple?: []; params?: {} }
    'auth.sign_up.show': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.show': { paramsTuple?: []; params?: {} }
    'auth.reset_password.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'social.create': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'roles.create': { paramsTuple?: []; params?: {} }
    'users.invite.show': { paramsTuple?: []; params?: {} }
    'users.activity': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.create': { paramsTuple?: []; params?: {} }
    'users.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'event_stream': { paramsTuple?: []; params?: {} }
    'help.index': { paramsTuple?: []; params?: {} }
    'help.space': { paramsTuple: [ParamValue]; params: {'space': ParamValue} }
    'help.image': { paramsTuple: [ParamValue,ParamValue]; params: {'space': ParamValue,'file': ParamValue} }
    'help.show': { paramsTuple: [ParamValue,ParamValue]; params: {'space': ParamValue,'article': ParamValue} }
    'help.content': { paramsTuple: [ParamValue,ParamValue]; params: {'space': ParamValue,'article': ParamValue} }
  }
  POST: {
    'auth.sign_in.handle': { paramsTuple?: []; params?: {} }
    'auth.sign_out.handle': { paramsTuple?: []; params?: {} }
    'auth.sign_up.handle': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.handle': { paramsTuple?: []; params?: {} }
    'auth.reset_password.handle': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'locale.switch': { paramsTuple: [ParamValue]; params: {'locale': ParamValue} }
    'roles.store': { paramsTuple?: []; params?: {} }
    'users.invite.handle': { paramsTuple?: []; params?: {} }
    'users.impersonate.handle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.store': { paramsTuple?: []; params?: {} }
    'tokens.store': { paramsTuple?: []; params?: {} }
    'notifications.markRead': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.markAllSeen': { paramsTuple?: []; params?: {} }
    'notifications.markAllRead': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'password.update': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.impersonate.stop': { paramsTuple?: []; params?: {} }
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tokens.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}