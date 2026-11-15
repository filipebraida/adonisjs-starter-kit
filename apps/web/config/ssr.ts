/**
 * Pages rendered on the server: the public ones, where first paint and
 * crawlers matter. A page name matches by prefix, so an admin page living in
 * the auth module (`auth/roles/*`) stays client-rendered like the rest of the
 * admin area.
 */
export const SSR_ROUTES = [
  'marketing',
  'auth/sign_in',
  'auth/sign_up',
  'auth/forgot_password',
  'auth/reset_password',
]

export const isSSREnableForPage = (page: string) =>
  SSR_ROUTES.some((prefix) => page.startsWith(prefix))
