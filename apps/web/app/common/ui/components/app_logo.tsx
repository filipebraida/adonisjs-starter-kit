import { Link } from '@tuyau/inertia/react'

import logo from '../images/logo.png'

export function AppLogo() {
  return (
    <Link route="marketing.show" prefetch className="flex items-center space-x-2">
      <div className="flex aspect-square size-8 items-center justify-center">
        <img src={logo} alt="Logo" className="size-8" />
      </div>
      <div className="ml-1 grid flex-1 text-left text-sm">
        <span className="mb-0.5 truncate leading-none font-semibold">AdonisJS Starter Kit</span>
      </div>
    </Link>
  )
}
