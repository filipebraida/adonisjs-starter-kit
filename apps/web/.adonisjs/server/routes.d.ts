import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
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
    'users.index': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.invite.handle': { paramsTuple?: []; params?: {} }
    'users.impersonate.handle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'tokens.index': { paramsTuple?: []; params?: {} }
    'tokens.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tokens.store': { paramsTuple?: []; params?: {} }
    'password.update': { paramsTuple?: []; params?: {} }
    'password.show': { paramsTuple?: []; params?: {} }
    'appearance.show': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'marketing.show': { paramsTuple?: []; params?: {} }
    'auth.sign_in.show': { paramsTuple?: []; params?: {} }
    'auth.sign_up.show': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.show': { paramsTuple?: []; params?: {} }
    'auth.reset_password.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'social.create': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'tokens.index': { paramsTuple?: []; params?: {} }
    'password.show': { paramsTuple?: []; params?: {} }
    'appearance.show': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'marketing.show': { paramsTuple?: []; params?: {} }
    'auth.sign_in.show': { paramsTuple?: []; params?: {} }
    'auth.sign_up.show': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.show': { paramsTuple?: []; params?: {} }
    'auth.reset_password.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'social.create': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'tokens.index': { paramsTuple?: []; params?: {} }
    'password.show': { paramsTuple?: []; params?: {} }
    'appearance.show': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.sign_in.handle': { paramsTuple?: []; params?: {} }
    'auth.sign_out.handle': { paramsTuple?: []; params?: {} }
    'auth.sign_up.handle': { paramsTuple?: []; params?: {} }
    'auth.forgot_password.handle': { paramsTuple?: []; params?: {} }
    'auth.reset_password.handle': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'locale.switch': { paramsTuple: [ParamValue]; params: {'locale': ParamValue} }
    'users.store': { paramsTuple?: []; params?: {} }
    'users.invite.handle': { paramsTuple?: []; params?: {} }
    'users.impersonate.handle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tokens.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'password.update': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tokens.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}