import { cn } from '@workspace/ui/lib/utils'

interface ContainerProps {
  className?: string
  children: React.ReactNode
}

export default function Container({ className, children }: ContainerProps) {
  return <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
}
