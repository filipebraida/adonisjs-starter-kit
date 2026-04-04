import usePageProps from './use_page_props'

type FlashMessages = {
  error?: string
  success?: string
}

export default function useFlashMessage<Key extends keyof FlashMessages>(key: Key) {
  const { flash } = usePageProps<{ flash: FlashMessages }>()
  return flash[key]
}
