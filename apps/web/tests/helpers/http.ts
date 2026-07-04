import type { ApiResponse } from '@japa/api-client'

// The app handler redirects back on E_AUTHORIZATION_FAILURE; without a Referer that lands on `/`.
export function assertForbiddenRedirect(response: ApiResponse): void {
  response.assertStatus(302)
  response.assertHeader('location', '/')
}
