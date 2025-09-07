import React, { useState } from 'react'
import { router } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { toast } from '@workspace/ui/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TokensActionDialog({ open, onOpenChange }: Props) {
  const [token, setToken] = useState<string | null>(null)
  const [name, setName] = useState<string>('')

  async function closeAndClean() {
    onOpenChange(false)
    setName('')
    setTimeout(() => {
      setToken(null)
    }, 500)

    router.visit('/settings/tokens')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const response = await fetch('/api/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name && name.length > 0 ? name : undefined }),
    })

    const result = await response.json()

    if ('token' in result) {
      setToken(result.token)
    }

    toast('You submitted the following values:', {
      description: (
        <div className="mt-2 max-w-[320px] overflow-x-auto rounded-md bg-slate-950 p-4">
          <pre className="text-white whitespace-pre-wrap break-words">
            <code>{JSON.stringify({ name }, null, 2)}</code>
          </pre>
        </div>
      ),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
        setTimeout(() => {
          setName('')
        }, 500)
      }}
    >
      <DialogContent className="sm:max-w-md">
        {!token ? (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="flex items-center gap-2">Add Token</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new token. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea>
              <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 m-1">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter token name"
                    value={name}
                    onChange={(element) => setName(element.target.value)}
                  />
                </div>
              </form>
            </ScrollArea>
            <DialogFooter className="gap-y-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" form="user-form">
                Add
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="flex items-center gap-2">Token Generated</DialogTitle>
              <DialogDescription>
                You can now use the generated token to authenticate API requests. Make sure to store
                it securely, as it will not be shown again.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea>
              <div className="space-y-4">
                <Input value={token} readOnly />
              </div>
            </ScrollArea>
            <DialogFooter className="gap-y-2">
              <Button onClick={closeAndClean} variant="outline">
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
