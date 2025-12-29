import SettingsLayout from '#users/ui/components/settings_layout'
import { AppearanceForm } from '#users/ui/components/appearance_form'

import HeadingSmall from '#common/ui/components/heading_small'
import AppLayout from '#common/ui/components/app_layout'

export default function Appearance() {
  return (
    <AppLayout breadcrumbs={[{ label: 'Appearance' }]}>
      <SettingsLayout currentPath="/settings/appearance">
        <div className="flex h-full w-full flex-1 flex-col overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-4xl space-y-6">
            <HeadingSmall
              title="Appearance"
              description="Customize the look and feel of the application. Automatically switch between day and night themes."
            />

            <AppearanceForm />
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
