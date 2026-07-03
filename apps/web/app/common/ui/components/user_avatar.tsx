import { cn } from '@workspace/ui/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'

export interface NavUserProps {
  user: {
    fullName: string | null | undefined
    email: string
    avatarUrl: string | null | undefined
  }
  className?: string
  shape?: 'circle' | 'square'
}

function generateFallbackText(user: { name?: string; email: string }): string {
  if (user.name) {
    const initials = user.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    return initials
  }
  return user.email.slice(0, 2).toUpperCase()
}

export function UserAvatar({ user, className, shape = 'circle' }: NavUserProps) {
  const fallbackText = generateFallbackText(user)

  return (
    <Avatar className={cn('h-8 w-8', className)} shape={shape}>
      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName ?? undefined} />
      <AvatarFallback>{fallbackText}</AvatarFallback>
    </Avatar>
  )
}
