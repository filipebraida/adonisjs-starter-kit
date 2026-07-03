import usePageProps from '#common/ui/hooks/use_page_props'
import type { GlobalPermissions } from '#users/services/global_permissions'

export default function useCan(): GlobalPermissions {
  const { can } = usePageProps<{ can: GlobalPermissions }>()
  return can
}
