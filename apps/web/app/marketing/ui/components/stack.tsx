import Container from '#marketing/ui/components/container'
import { Layers } from 'lucide-react'

export default function StackSection() {
  const stack = [
    { name: 'AdonisJS 6', description: 'Robust Backend Framework' },
    { name: 'Inertia.js', description: 'Seamless Monolith' },
    { name: 'React', description: 'Dynamic UI' },
    { name: 'Tailwind CSS', description: 'Utility-First Styling' },
    { name: 'PostgreSQL', description: 'Reliable Database' },
  ]

  return (
    <section className="py-12 border-y bg-muted/30">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 text-muted-foreground font-medium shrink-0">
            <Layers className="size-5" />
            <span>Powering your next idea with:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-8 gap-y-4">
            {stack.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center md:items-start group cursor-default"
              >
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
