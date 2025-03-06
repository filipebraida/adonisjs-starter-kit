import { Link } from '@inertiajs/react'
import { GalleryVerticalEnd } from 'lucide-react'

export function AppLogo() {
  return (
    <Link href="/" prefetch className="flex items-center space-x-2">
      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
        <GalleryVerticalEnd className="size-5 fill-current text-white dark:text-black" />
      </div>
      <div className="ml-1 grid flex-1 text-left text-sm">
        <span className="mb-0.5 truncate leading-none font-semibold">AdonisJS Starter Kit</span>
      </div>
    </Link>
  )
}
