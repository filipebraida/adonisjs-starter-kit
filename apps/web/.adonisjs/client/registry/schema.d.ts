/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'drive.fs.serve': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/*'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
    }
  }
  'marketing.show': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#marketing/controllers/marketing_controller').default['handle']>>>
    }
  }
  'auth.sign_in.show': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#auth/controllers/sign_in_controller').default['show']>>>
    }
  }
  'sign_in': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators').signInValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators').signInValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#auth/controllers/sign_in_controller').default['handle']>>>
    }
  }
  'auth.sign_out.show': {
    methods: ["GET","HEAD"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#auth/controllers/sign_out_controller').default['handle']>>>
    }
  }
  'auth.sign_up.show': {
    methods: ["GET","HEAD"]
    pattern: '/sign-up'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#auth/controllers/sign_up_controller').default['show']>>>
    }
  }
  'auth.sign_up.handle': {
    methods: ["POST"]
    pattern: '/sign-up'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators').signUpValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators').signUpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#auth/controllers/sign_up_controller').default['handle']>>>
    }
  }
  'auth.forgot_password.show': {
    methods: ["GET","HEAD"]
    pattern: '/forgot-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#auth/controllers/forgot_password_controller').default['show']>>>
    }
  }
  'auth.forgot_password.handle': {
    methods: ["POST"]
    pattern: '/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#auth/controllers/forgot_password_controller').default['handle']>>>
    }
  }
  'auth.reset_password.show': {
    methods: ["GET","HEAD"]
    pattern: '/reset-password/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#auth/controllers/reset_password_controller').default['show']>>>
    }
  }
  'auth.reset_password.handle': {
    methods: ["POST"]
    pattern: '/reset-password/:token'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators').resetPasswordValidator)>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#auth/validators').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#auth/controllers/reset_password_controller').default['handle']>>>
    }
  }
  'social.create': {
    methods: ["GET","HEAD"]
    pattern: '/:provider/redirect'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#auth/controllers/social_controller').default['redirect']>>>
    }
  }
  'social.callback': {
    methods: ["GET","HEAD"]
    pattern: '/:provider/callback'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#auth/controllers/social_controller').default['callback']>>>
    }
  }
  'users.index': {
    methods: ["GET","HEAD"]
    pattern: '/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#users/validators').listUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/users_controller').default['index']>>>
    }
  }
  'users.store': {
    methods: ["POST"]
    pattern: '/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#users/validators').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/users_controller').default['store']>>>
    }
  }
  'users.update': {
    methods: ["PUT","PATCH"]
    pattern: '/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators').editUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#users/validators').editUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/users_controller').default['update']>>>
    }
  }
  'users.destroy': {
    methods: ["DELETE"]
    pattern: '/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/users_controller').default['destroy']>>>
    }
  }
  'invite': {
    methods: ["POST"]
    pattern: '/users/invite'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators').inviteUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#users/validators').inviteUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/invite_controller').default['handle']>>>
    }
  }
  'impersonates.store': {
    methods: ["POST"]
    pattern: '/users/impersonate/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/impersonates_controller').default['store']>>>
    }
  }
  'settings.index': {
    methods: ["GET","HEAD"]
    pattern: '/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
    }
  }
  'profile': {
    methods: ["PUT"]
    pattern: '/settings/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators').updateProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#users/validators').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/profile_controller').default['handle']>>>
    }
  }
  'profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/settings/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/profile_controller').default['show']>>>
    }
  }
  'tokens.index': {
    methods: ["GET","HEAD"]
    pattern: '/settings/tokens'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/tokens_controller').default['index']>>>
    }
  }
  'tokens.destroy': {
    methods: ["DELETE"]
    pattern: '/settings/tokens/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/tokens_controller').default['destroy']>>>
    }
  }
  'tokens.store': {
    methods: ["POST"]
    pattern: '/api/tokens'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators').createTokenValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#users/validators').createTokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/tokens_controller').default['store']>>>
    }
  }
  'password': {
    methods: ["PUT"]
    pattern: '/settings/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators').updatePasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#users/validators').updatePasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/password_controller').default['handle']>>>
    }
  }
  'password.show': {
    methods: ["GET","HEAD"]
    pattern: '/settings/password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#users/controllers/password_controller').default['show']>>>
    }
  }
  'appearance.show': {
    methods: ["GET","HEAD"]
    pattern: '/settings/appearance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
    }
  }
  'dashboard.show': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#analytics/controllers/dashboard_controller').default['handle']>>>
    }
  }
}
