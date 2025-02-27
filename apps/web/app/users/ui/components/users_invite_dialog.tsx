import React from 'react'
import { useForm } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
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
import { Progress } from '@workspace/ui/components/progress'
import { toast } from '@workspace/ui/hooks/use-toast'
import { cn } from '@workspace/ui/lib/utils'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@workspace/ui/components/select'

import RoleDto from '#users/dtos/role'
import UserDto from '#users/dtos/user'

import Roles from '#users/enums/role'

import { userRoles } from './users_types'
import { MailPlus, Send } from 'lucide-react'

interface Props {
  roles: RoleDto[]
  currentRow?: UserDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersInviteDialog({ roles, open, onOpenChange }: Props) {
  const { data, setData, errors, post, progress, clearErrors, reset } = useForm<{
    email: string
    roleId: string
    description: string | null
  }>({
    email: '',
    roleId: String(Roles.USER),
    description: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    post('/users/invite', {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false)
        setTimeout(() => {
          reset()
          clearErrors()
        }, 500)
        toast({
          title: 'You submitted the following values:',
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">{JSON.stringify(data, null, 2)}</code>
            </pre>
          ),
        })
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
        setTimeout(() => {
          reset()
          clearErrors()
        }, 500)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2">
            <MailPlus /> Invite User
          </DialogTitle>
          <DialogDescription>
            Invite new user to join your team by sending them an email invitation. Assign a role to
            define their access level.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="w-full pr-4 -mr-4 py-1">
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4 p-0.5">
            <div>
              <Label htmlFor="email" className="mb-1 text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                placeholder="Digite o email do usuário"
                value={data.email}
                onChange={(element) => setData('email', element.target.value)}
                className={`${errors?.email ? 'border-red-500' : ''}`}
              />
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors?.email}
              </p>
            </div>

            <div>
              <Label htmlFor="role" className="mb-1 text-gray-700">
                Role
              </Label>
              <Select value={data.roleId} onValueChange={(value) => setData('roleId', value)}>
                <SelectTrigger className={`${errors?.roleId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select uma role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roles.map((role) => {
                      const userRole = userRoles.find(({ id }) => id === role.id)

                      return (
                        <SelectItem key={role.id} value={String(role.id)}>
                          <span className="flex gap-x-2 items-center">
                            {userRole && userRole.icon && (
                              <userRole.icon size={16} className="text-muted-foreground" />
                            )}

                            <span className="capitalize text-sm">{role.name}</span>
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors?.roleId}
              </p>
            </div>

            <div>
              <Label htmlFor="password" className="mb-1 text-gray-700">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Add a personal note to your invitation (optional)"
                value={data.description ?? ''}
                onChange={(element) => setData('description', element.target.value)}
                className={cn('resize-none', `${errors?.description ? 'border-red-500' : ''}`)}
              />
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors?.description}
              </p>
            </div>

            {progress && (
              <Progress
                value={progress.percentage}
                max={100}
                className="w-full h-2 bg-gray-200 rounded mt-2"
              />
            )}
          </form>
        </ScrollArea>
        <DialogFooter className="gap-y-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" form="user-form">
            Invite <Send />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
