import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import { CheckCircle2, Plus, Ticket, Trash2, X } from 'lucide-react'

import { TokensActionDialog } from '#users/ui/components/tokens_action_dialog'
import { TokensDeleteDialog } from '#users/ui/components/tokens_delete_dialog'

import { useTranslation } from '#common/ui/hooks/use_translation'

import { Button } from '@workspace/ui/components/button'
import { CopyButton } from '@workspace/ui/components/copy-button'
import { Input } from '@workspace/ui/components/input'
import { cn } from '@workspace/ui/lib/utils'
import { toast } from '@workspace/ui/hooks/use-toast'

import type { Data } from '@generated/data'

interface NewToken {
  name: string
  value: string
}

interface Props {
  tokens: Data.Users.Token[]
  newToken: NewToken | null
}

export function TokensSection({ tokens, newToken }: Props) {
  const { t } = useTranslation()
  const [addOpen, setAddOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Data.Users.Token | null>(null)
  const [revealed, setRevealed] = useState<NewToken | null>(null)

  useEffect(() => {
    if (newToken) setRevealed(newToken)
  }, [newToken])

  return (
    <div>
      {revealed && (
        <div className="mb-4 rounded-xl border border-primary/40 bg-primary/5 p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span className="text-sm font-medium">
                {t('users.tokens.dialogs.generated.title')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRevealed(null)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t('users.action.actions.close')}
            >
              <X size={16} />
            </button>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            {t('users.tokens.dialogs.generated.description')}
          </p>
          <div className="flex gap-2">
            <Input value={revealed.value} readOnly className="font-mono text-xs" />
            <CopyButton
              content={revealed.value}
              onCopy={() =>
                toast(t('users.action.toast.type_success'), {
                  description: t('users.tokens.copied'),
                })
              }
            />
          </div>
        </div>
      )}

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
