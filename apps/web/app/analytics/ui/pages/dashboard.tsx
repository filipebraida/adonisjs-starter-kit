import AppLayout from '#common/ui/components/app_layout'

import { Main } from '#common/ui/components/main'

export default function Page() {
  return (
    <AppLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <Main>
        <div className="flex flex-1 flex-col gap-4 py-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50" />
        </div>
      </Main>
    </AppLayout>
  )
}
