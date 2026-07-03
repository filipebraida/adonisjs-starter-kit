import { useState } from 'react'
import { DateTime } from 'luxon'
import { Plus, Ticket, Trash2 } from 'lucide-react'

import { TokensActionDialog } from '#users/ui/components/tokens_action_dialog'
import { TokensDeleteDialog } from '#users/ui/components/tokens_delete_dialog'

import { useTranslation } from '#common/ui/hooks/use_translation'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import type { Data } from '@generated/data'

interface Props {
  tokens: Data.Users.Token[]
}

export function TokensSection({ tokens }: Props) {
  const { t } = useTranslation()
  const [addOpen, setAddOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Data.Users.Token | null>(null)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {t('users.tokens.active_count', { count: tokens.length })}
        </span>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={15} />
          {t('users.tokens.create_button')}
        </Button>
      </div>

      {tokens.length > 0 && (
        <ul className="overflow-hidden rounded-xl border border-border">
          {tokens.map((token, idx) => (
            <li
              key={token.id}
              className={cn(
                'flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40',
                idx > 0 && 'border-t border-border'
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Ticket size={16} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{token.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {formatTokenMeta(token, t)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label={t('users.delete_token.confirm_button')}
                onClick={() => setToDelete(token)}
              >
                <Trash2 size={16} />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <TokensActionDialog open={addOpen} onOpenChange={setAddOpen} />
      {toDelete && (
        <TokensDeleteDialog
          open
          onOpenChange={(open) => !open && setToDelete(null)}
          currentRow={toDelete}
        />
      )}
    </div>
  )
}

function formatTokenMeta(
  token: Data.Users.Token,
  t: (key: string, opts?: Record<string, unknown>) => string
) {
  const created = DateTime.fromISO(token.createdAt).toLocaleString(DateTime.DATE_MED)
  const parts = [t('users.tokens.created_word', { date: created })]

  if (token.lastUsedAt) {
    const lastUsed = DateTime.fromISO(token.lastUsedAt).toRelative() ?? ''
    parts.push(t('users.tokens.last_used_word', { time: lastUsed }))
  }

  return parts.join(' · ')
}
