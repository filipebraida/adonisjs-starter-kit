import { InferPageProps } from '@adonisjs/inertia/types'

import ProfileController from '#users/controllers/profile_controller'

import AppLayout from '#common/ui/components/app_sidebar_layout'
import HeadingSmall from '#common/ui/components/heading_small'
import { ProfileForm } from '#users/ui/components/profile_form'

import ProfileLayout from '#users/ui/components/profile_layout'

export default function ProfilePage({ profile }: InferPageProps<ProfileController, 'show'>) {
  const currentPath = '/settings/profile'

  return (
    <AppLayout breadcrumbs={[{ label: 'Usuários' }]}>
      <ProfileLayout currentPath={currentPath}>
        <div className="space-y-6">
          <HeadingSmall
            title="Profile information"
            description="Update your name and email address"
          />
          <ProfileForm user={profile} />
        </div>
      </ProfileLayout>
    </AppLayout>
  )
}
