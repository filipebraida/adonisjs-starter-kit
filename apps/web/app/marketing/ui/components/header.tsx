import { useState } from 'react'
import { Link } from '@tuyau/inertia/react'

import { GalleryVerticalEnd, MenuIcon } from 'lucide-react'

export default function HeaderSection() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky -top-3 pt-5 pb-2 bg-background text-foreground z-50">
      <div className="grid w-full grid-cols-2 md:grid-cols-3 items-center">
        <div
          className={`absolute top-0 left-0 w-full h-screen backdrop-blur-lg bg-background/80 z-40 flex flex-col items-center gap-4 py-16 transition-all duration-500 ${
            menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          } md:hidden`}
        >
          <div className="flex flex-col w-full pt-8 gap-1 -mx-3">
            <a
              className="w-auto rounded-xl font-medium transition-all duration-300 md:font-semibold md:-mx-3 md:inline-flex md:items-center md:justify-center px-3 py-2 md:text-sm hover:bg-muted"
              href="/#features"
            >
              Features
            </a>
            <Link
              route="auth.sign_in.show"
              className="w-auto rounded-xl font-medium transition-all duration-300 md:font-semibold md:-mx-3 md:inline-flex md:items-center md:justify-center px-3 py-2 md:text-sm hover:bg-muted"
            >
              Login
            </Link>
          </div>
        </div>
        <Link route="marketing.show" className="flex items-center gap-2.5 relative z-50">
          <GalleryVerticalEnd className="h-6 w-6 mr-2" />
          <span className="font-semibold">AdonisJS Starter Kit</span>
        </Link>

        <div className="hidden md:flex items-center justify-center gap-8">
          <a
            className="w-auto rounded-xl font-medium transition-all duration-300 md:font-semibold md:-mx-3 md:inline-flex md:items-center md:justify-center px-3 py-2 md:text-sm hover:bg-muted"
            href="/#features"
          >
            Features
          </a>
        </div>

        <div className="flex justify-end relative z-50">
          <Link
            route="auth.sign_in.show"
            className="w-auto rounded-xl font-medium transition-all duration-300 md:font-semibold md:-mx-3 md:items-center md:justify-center px-3 py-2 md:text-sm hover:bg-muted hidden md:block"
          >
            Login
          </Link>
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center rounded-xl px-2 py-2 transition-all duration-300 hover:bg-muted md:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </nav>
  )
}
