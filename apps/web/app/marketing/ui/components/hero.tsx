import { Link } from '@tuyau/inertia/react'
import { Github } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import Container from '#marketing/ui/components/container'
import featureHero from '../images/feature_hero.png'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <Container className="relative z-10">
        <div className="flex flex-col gap-10 text-center items-center">
          <div className="relative flex flex-col gap-6 items-center max-w-3xl">
            <div
              style={{
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute left-1/2 top-1/2 -z-10 mx-auto size-[600px] rounded-full border p-16 opacity-40 [mask-image:linear-gradient(to_top,transparent,transparent,white,white,white,transparent,transparent)] md:size-[1000px] md:p-32"
            >
              <div className="size-full rounded-full border p-16 md:p-32 bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
            </div>

            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
              v1.0.0 Now Available
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              AdonisJS Starter Kit
            </h1>

            <p className="text-lg text-muted-foreground md:text-xl text-balance max-w-2xl">
              Accelerate your development with a robust, production-ready monorepo template. Powered
              by AdonisJS, Inertia, ShadCN, and Tailwind using modern standards.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button size="lg" className="h-12 px-8 text-base rounded-full" asChild>
                <Link route="auth.sign_in.show">Get Started</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base rounded-full gap-2"
                asChild
              >
                <a
                  href="https://github.com/filipebraida/adonisjs-starter-kit"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="size-5" />
                  Star on GitHub
                </a>
              </Button>
            </div>

            <div className="text-sm text-muted-foreground pt-2">
              The ultimate starting point for your next big idea.
            </div>
          </div>

          <div className="relative w-full max-w-5xl mt-10 p-2 rounded-2xl bg-gradient-to-b from-border/50 to-transparent">
            <div className="rounded-xl overflow-hidden border bg-background/50 backdrop-blur shadow-2xl">
              <img
                src={featureHero}
                alt="AdonisJS Starter Kit Dashboard"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
