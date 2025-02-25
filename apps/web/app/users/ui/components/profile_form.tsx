import React from 'react'
import { useForm } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Progress } from '@workspace/ui/components/progress'

import UserDto from '#users/dtos/user'
import { toast } from '@workspace/ui/hooks/use-toast'

interface Props {
  user: UserDto
}

export function ProfileForm({ user }: Props) {
  const { data, setData, errors, put, progress } = useForm({
    fullName: user.fullName ? user.fullName : '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    put('/settings/profile', {
      preserveScroll: true,
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-0.5">
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
        <p>{user.email}</p>
      </div>

      {progress && (
        <Progress
          value={progress.percentage}
          max={100}
          className="w-full h-2 bg-gray-200 rounded mt-2"
        />
      )}
      <Button type="submit">Save</Button>
    </form>
  )
}
