import { useTokens } from '#users/ui/context/tokens_context'
import { TokensActionDialog } from '#users/ui/components/tokens_action_dialog'
import { TokensDeleteDialog } from '#users/ui/components/tokens_delete_dialog'

export function TokensDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTokens()
  return (
    <>
      <TokensActionDialog
        key="token-add"
        open={open === 'add'}
        onOpenChange={(state) => setOpen(state ? 'add' : null)}
      />

      {currentRow && (
        <>
          <TokensDeleteDialog
            key={`token-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(state) => {
              setOpen(state ? 'delete' : null)
              if (!state) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
