export const USERS_SORT_BY = ['fullName', 'email', 'createdAt'] as const
export type UsersSortBy = (typeof USERS_SORT_BY)[number]

export const USERS_SORT_COLUMN: Record<UsersSortBy, string> = {
  fullName: 'full_name',
  email: 'email',
  createdAt: 'created_at',
}

export const SORT_DIRECTIONS = ['asc', 'desc'] as const
export type SortDirection = (typeof SORT_DIRECTIONS)[number]
