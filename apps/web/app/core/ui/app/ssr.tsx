import ReactDOMServer from 'react-dom/server'
import { createInertiaApp } from '@inertiajs/react'

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
    setup: ({ App, props }) => <App {...props} />,
  })
}
