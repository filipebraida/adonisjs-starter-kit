import usePageProps from './use_page_props'

export default function useFlashMessage(key: string) {
  const { flashMessages } = usePageProps<{ flashMessages: Record<string, string> }>()
  return flashMessages[key] ?? ''
}
