import usePageProps from '#common/ui/hooks/use_page_props'
import type { GlobalPermissions } from '#users/services/global_permissions'

/**
 * Returns the typed struct of global permission flags shared by the Inertia
 * middleware. Use for layout-level decisions (menus, sidebar items). For
 * per-resource permissions, pass a `permissions` prop from the controller.
 */
export default function useCan(): GlobalPermissions {
  const { can } = usePageProps<{ can: GlobalPermissions }>()
  return can
}
