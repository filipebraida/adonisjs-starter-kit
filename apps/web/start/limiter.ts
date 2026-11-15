/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

/**
 * Public forms that create something (sign-up). Keyed by IP, so a classroom
 * behind one NAT shares it: generous per minute, no long block.
 */
export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(10).every('1 minute')
})
