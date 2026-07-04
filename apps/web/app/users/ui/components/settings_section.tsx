import { cn } from '@workspace/ui/lib/utils'

interface Props {
  title: string
  description?: string
  last?: boolean
  children: React.ReactNode
}

export function SettingsSection({ title, description, last, children }: Props) {
  return (
    <section
      className={cn('flex flex-wrap gap-x-10 gap-y-6 py-8', !last && 'border-b border-border')}
    >
      <div className="w-full lg:w-52 lg:flex-shrink-0">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      <div className="min-w-0 flex-1 lg:max-w-[560px]">{children}</div>
    </section>
  )
}
