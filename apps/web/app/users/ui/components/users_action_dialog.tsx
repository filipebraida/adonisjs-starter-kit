import React from 'react'
import { useForm } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'
import { PasswordInput } from '@workspace/ui/components/password-input'
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

interface Props {
  roles: RoleDto[]
  currentRow?: UserDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ roles, currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow

  const { data, setData, errors, post, put, progress, clearErrors, reset } = useForm({
    fullName: currentRow && currentRow.fullName ? currentRow.fullName : '',
    email: currentRow ? currentRow.email : '',
    roleId: currentRow ? String(currentRow.roleId) : String(Roles.USER),
    password: '',
    passwordConfirmation: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const url = isEdit ? `/users/${currentRow?.id}` : '/users'
    const method = isEdit ? put : post

    method(url, {
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
            {isEdit ? 'Edit User' : 'Add User'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : ' Fill in the details below to add a new user. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="w-full pr-4 -mr-4 py-1">
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4 p-0.5">
            <div>
              <Label htmlFor="name" className="mb-1 text-gray-700">
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="Enter user's full name"
                value={data.fullName}
                onChange={(element) => setData('fullName', element.target.value)}
                className={`${errors?.fullName ? 'border-red-500' : ''}`}
              />
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors?.fullName}
              </p>
            </div>

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
                Password
              </Label>
              <PasswordInput
                id="password"
                placeholder="e.g., S3cur3P@ssw0rd"
                value={data.password}
                onChange={(element) => setData('password', element.target.value)}
                className={`${errors?.password ? 'border-red-500' : ''}`}
              />
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors?.password}
              </p>
            </div>

            <div>
              <Label htmlFor="passwordConfirmation" className="mb-1 text-gray-700">
                Confirm Password
              </Label>
              <PasswordInput
                id="passwordConfirmation"
                disabled={data.password === ''}
                placeholder="e.g., S3cur3P@ssw0rd"
                value={data.passwordConfirmation}
                onChange={(element) => setData('passwordConfirmation', element.target.value)}
                className={`${errors?.passwordConfirmation ? 'border-red-500' : ''}`}
              />
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors?.passwordConfirmation}
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
            {isEdit ? 'Save' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
