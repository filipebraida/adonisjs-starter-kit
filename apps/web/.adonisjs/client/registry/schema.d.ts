/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractRawResponse, ExtractResponse, Method, PathWithRegistry, PatternsByMethod, RouteWithRegistry } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'
import type { routes } from './index.ts'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'drive.fs.serve': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/*'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { '*': ParamValue[] }
      query: {}
      response: unknown
      errorResponse: unknown
      rawResponse: ExtractRawResponse<unknown>
    }
  }
  'health.live': {
    methods: ["GET","HEAD"]
    pattern: '/health/live'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/core/controllers/liveness_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/core/controllers/liveness_controller').default['handle']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/core/controllers/liveness_controller').default['handle']>>>
    }
  }
  'health.ready': {
    methods: ["GET","HEAD"]
    pattern: '/health/ready'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/core/controllers/readiness_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/core/controllers/readiness_controller').default['handle']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/core/controllers/readiness_controller').default['handle']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/marketing/controllers/marketing_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/marketing/controllers/marketing_controller').default['handle']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/marketing/controllers/marketing_controller').default['handle']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_in_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_in_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_in_controller').default['show']>>>
    }
  }
  'auth.sign_in.handle': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/auth').signInValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/auth').signInValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_in_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_in_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_in_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.sign_out.handle': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_out_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_out_controller').default['handle']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_out_controller').default['handle']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_up_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_up_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_up_controller').default['show']>>>
    }
  }
  'auth.sign_up.handle': {
    methods: ["POST"]
    pattern: '/sign-up'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/auth').signUpValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/auth').signUpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_up_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_up_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_up_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/forgot_password_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/forgot_password_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/controllers/forgot_password_controller').default['show']>>>
    }
  }
  'auth.forgot_password.handle': {
    methods: ["POST"]
    pattern: '/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/auth').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/auth').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/forgot_password_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/forgot_password_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/controllers/forgot_password_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/reset_password_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/reset_password_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/controllers/reset_password_controller').default['show']>>>
    }
  }
  'auth.reset_password.handle': {
    methods: ["POST"]
    pattern: '/reset-password/:token'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/auth').resetPasswordValidator)>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/auth').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/reset_password_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/reset_password_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/controllers/reset_password_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/redirect_to_provider_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/redirect_to_provider_controller').default['handle']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/controllers/redirect_to_provider_controller').default['handle']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/authenticate_with_social_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/authenticate_with_social_controller').default['handle']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/controllers/authenticate_with_social_controller').default['handle']>>>
    }
  }
  'locale.switch': {
    methods: ["POST"]
    pattern: '/switch/:locale'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { locale: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
      rawResponse: ExtractRawResponse<unknown>
    }
  }
  'users.invite.show': {
    methods: ["GET","HEAD"]
    pattern: '/users/invite'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/invite_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/invite_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/invite_controller').default['show']>>>
    }
  }
  'users.invite.handle': {
    methods: ["POST"]
    pattern: '/users/invite'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators/users').inviteUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#users/validators/users').inviteUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/invite_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/invite_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/invite_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.impersonate.handle': {
    methods: ["POST"]
    pattern: '/users/impersonate/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/impersonate_user_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/impersonate_user_controller').default['handle']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/impersonate_user_controller').default['handle']>>>
    }
  }
  'users.activity': {
    methods: ["GET","HEAD"]
    pattern: '/users/activity'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#users/validators/audits').listAuditsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/activity_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/activity_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/activity_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.index': {
    methods: ["GET","HEAD"]
    pattern: '/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#users/validators/users').listUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.create': {
    methods: ["GET","HEAD"]
    pattern: '/users/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['create']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['create']>>>
    }
  }
  'users.store': {
    methods: ["POST"]
    pattern: '/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators/users').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#users/validators/users').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.edit': {
    methods: ["GET","HEAD"]
    pattern: '/users/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['edit']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['edit']>>>
    }
  }
  'users.update': {
    methods: ["PUT","PATCH"]
    pattern: '/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators/users').editUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#users/validators/users').editUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/users_controller').default['destroy']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/settings_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/settings_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/settings_controller').default['show']>>>
    }
  }
  'profile.update': {
    methods: ["PUT"]
    pattern: '/settings/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators/users').updateProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#users/validators/users').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/profile_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/profile_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/profile_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password.update': {
    methods: ["PUT"]
    pattern: '/settings/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators/users').updatePasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#users/validators/users').updatePasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/password_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/password_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/password_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/tokens_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/tokens_controller').default['destroy']>>>
    }
  }
  'tokens.store': {
    methods: ["POST"]
    pattern: '/settings/tokens'
    types: {
      body: ExtractBody<InferInput<(typeof import('#users/validators/tokens').createTokenValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#users/validators/tokens').createTokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/users/controllers/tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/users/controllers/tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/users/controllers/tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'dashboard.show': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#analytics/validators/dashboard').dashboardQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/analytics/controllers/dashboard_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/analytics/controllers/dashboard_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/analytics/controllers/dashboard_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'notifications.index': {
    methods: ["GET","HEAD"]
    pattern: '/notifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/notifications/controllers/notifications_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/notifications/controllers/notifications_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/notifications/controllers/notifications_controller').default['index']>>>
    }
  }
  'notifications.markRead': {
    methods: ["POST"]
    pattern: '/notifications/:id/read'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/notifications/controllers/mark_notification_read_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/notifications/controllers/mark_notification_read_controller').default['handle']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/notifications/controllers/mark_notification_read_controller').default['handle']>>>
    }
  }
  'notifications.markAllSeen': {
    methods: ["POST"]
    pattern: '/notifications/seen'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/notifications/controllers/mark_all_notifications_seen_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/notifications/controllers/mark_all_notifications_seen_controller').default['handle']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/notifications/controllers/mark_all_notifications_seen_controller').default['handle']>>>
    }
  }
  'notifications.markAllRead': {
    methods: ["POST"]
    pattern: '/notifications/read'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/notifications/controllers/mark_all_notifications_read_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/notifications/controllers/mark_all_notifications_read_controller').default['handle']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/notifications/controllers/mark_all_notifications_read_controller').default['handle']>>>
    }
  }
}

export namespace Route {
  export type Request<Name extends keyof typeof routes> = RouteWithRegistry.Request<typeof routes, Name>
  export type Response<Name extends keyof typeof routes> = RouteWithRegistry.Response<typeof routes, Name>
  export type Params<Name extends keyof typeof routes> = RouteWithRegistry.Params<typeof routes, Name>
  export type Body<Name extends keyof typeof routes> = RouteWithRegistry.Body<typeof routes, Name>
  export type Query<Name extends keyof typeof routes> = RouteWithRegistry.Query<typeof routes, Name>
  export type Error<Name extends keyof typeof routes> = RouteWithRegistry.Error<typeof routes, Name>
}

export namespace Path {
  export type Request<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Request<typeof routes, M, P>
  export type Response<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Response<typeof routes, M, P>
  export type Params<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Params<typeof routes, M, P>
  export type Body<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Body<typeof routes, M, P>
  export type Query<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Query<typeof routes, M, P>
  export type Error<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Error<typeof routes, M, P>
}
