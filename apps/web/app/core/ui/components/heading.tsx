interface HeadingProps extends React.PropsWithChildren {
  title: string
  description?: string
  /** The screen's "?" (`HelpLink`), beside the title. */
  help?: React.ReactNode
}

export default function Heading({ title, description, help, children }: HeadingProps) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div>
        <div className="flex items-center gap-1">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {help}
        </div>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}
