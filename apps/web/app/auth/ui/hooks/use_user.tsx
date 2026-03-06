import usePageProps from '#common/ui/hooks/use_page_props'

import type { Data } from '@generated/data'

export default function useUser() {
  const { user } = usePageProps<{ user: Data.Users.User }>()
  return user
}
