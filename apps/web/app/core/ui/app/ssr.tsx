import ReactDOMServer from 'react-dom/server'
import { createInertiaApp } from '@inertiajs/react'
import { TuyauProvider } from '@tuyau/inertia/react'
import { tuyau } from './tuyau'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const firstPart = name.split('/')[0]
      const rest = name.split('/').slice(1).join('/')

      const pages = import.meta.glob('/app/*/ui/pages/**/*.tsx', { eager: true })
      return pages[`/app/${firstPart}/ui/pages/${rest}.tsx`]
    },
    setup: ({ App, props }) => (
      <TuyauProvider client={tuyau}>
        <App {...props} />
      </TuyauProvider>
    ),
  })
}
