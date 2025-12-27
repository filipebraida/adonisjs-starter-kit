import SettingsLayout from '#users/ui/components/settings_layout'
import { AppearanceForm } from '#users/ui/components/appearance_form'
import { Separator } from '@workspace/ui/components/separator'

import AppLayout from '#common/ui/components/app_layout'

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={[{ label: 'Appearance' }]}>
            <SettingsLayout currentPath="/settings/appearance">
                <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
                    <div className="flex-none p-6 pb-0">
                        <div>
                            <h3 className="text-lg font-medium">Appearance</h3>
                            <p className="text-sm text-muted-foreground">
                                Customize the look and feel of the application. Automatically switch between day and night themes.
                            </p>
                        </div>
                        <Separator className="mt-4" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 pt-6">
                        <AppearanceForm />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    )
}
