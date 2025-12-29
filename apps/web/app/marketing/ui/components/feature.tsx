import Container from '#marketing/ui/components/container'
import { Palette, Globe, Zap } from 'lucide-react'

export default function FeatureSection() {
  return (
    <section className="py-24 bg-muted/30" id="details">
      <Container>
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-primary bg-primary/10 border-primary/20 mb-6">
            Everything else
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
            Packed with developer-first features
          </h2>
          <p className="text-lg text-muted-foreground">
            We didn't stop at the basics. Experience a fully loaded starter kit designed for scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Card 1: Theming */}
          <div className="flex flex-col gap-4 p-8 rounded-3xl border bg-background hover:shadow-lg transition-shadow">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Dynamic Theming</h3>
            <p className="text-muted-foreground">
              Switch between Sidebar and Header layouts, toggle Dark Mode, and customize appearance
              preferences with persistence.
            </p>
          </div>

          {/* Card 2: i18n */}
          <div className="flex flex-col gap-4 p-8 rounded-3xl border bg-background hover:shadow-lg transition-shadow">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Internationalization</h3>
            <p className="text-muted-foreground">
              Built-in i18n support with pre-configured localizations (English & Portuguese) and
              easy expansion.
            </p>
          </div>

          {/* Card 3: Performance/DX */}
          <div className="flex flex-col gap-4 p-8 rounded-3xl border bg-background hover:shadow-lg transition-shadow">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Developer Experience</h3>
            <p className="text-muted-foreground">
              Monorepo setup with TurboRepo, pnpm, and best practices baked in. Ready for your team
              to scale.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
