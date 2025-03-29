interface HeadingSmallProps extends React.PropsWithChildren {
  title: string
  description?: string
}

export default function HeadingSmall({ title, description, children }: HeadingSmallProps) {
  return (
    <div className="flex items-center justify-between space-y-2 flex-wrap mb-4">
      <header>
        <h3 className="mb-0.5 text-base font-medium">{title}</h3>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </header>

      {children}
    </div>
  )
}
