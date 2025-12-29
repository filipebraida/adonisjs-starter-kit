import { useState } from 'react'
import { Link } from '@tuyau/inertia/react'
import { MenuIcon } from 'lucide-react'

import Container from '#marketing/ui/components/container'
import { AppLogo } from '#common/ui/components/app_logo'

export default function HeaderSection() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-background">
      <Container className="flex h-16 items-center justify-between">
        <div
          className={`absolute top-0 left-0 w-full h-screen bg-background z-40 flex flex-col items-center gap-4 py-16 transition-all duration-300 ${
            menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          } md:hidden`}
        >
          <div className="flex flex-col w-full pt-8 gap-4 px-6">
            <Link
              route="auth.sign_in.show"
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-3 text-center"
            >
              Get Started
            </Link>
            <a
              className="w-full rounded-xl border font-medium px-4 py-3 text-center hover:bg-muted transition-colors"
              href="#features"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </a>
          </div>
        </div>

        <AppLogo />

        <div className="hidden md:flex items-center gap-6">
          <a
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            href="#features"
          >
            Features
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            route="auth.sign_in.show"
            className="hidden md:inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center rounded-md p-2 hover:bg-accent md:hidden"
          >
            <MenuIcon className="size-5" />
          </button>
        </div>
      </Container>
    </nav>
  )
}
