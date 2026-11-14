interface HeadingProps extends React.PropsWithChildren {
  title: string
  description?: string
}

export default function Heading({ title, description, children }: HeadingProps) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between space-y-2 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
    </>
  )
}
