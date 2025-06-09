import { Link } from '@tuyau/inertia/react'

import logo from '../images/logo.png'

export function AppLogo() {
  return (
    <Link route="marketing.show" prefetch className="flex items-center space-x-2">
      <div className="flex aspect-square size-8 items-center justify-center">
        <img src={logo} alt="Logo" className="size-8" />
      </div>
      <div className="ml-1 grid flex-1 text-left leading-tight text-sm">
        <span className="font-semibold">Starter Kit</span>
        <span className="text-muted-foreground text-xs">AdonisJS</span>
      </div>
    </Link>
  )
}
