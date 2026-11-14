import { Head } from '@inertiajs/react'
import type { InertiaProps } from '#core/ui/app/types'

import AdminLayout from '#core/ui/components/admin_layout'
import Heading from '#core/ui/components/heading'
import { Main } from '#core/ui/components/main'

import ActivityTable from '#users/ui/components/activity_table'

import { useTranslation } from '#core/ui/hooks/use_translation'

import type { AuditEvent } from '#auth/enums/audit_event'

import type { Data } from '@generated/data'

type PageProps = InertiaProps<{
  audits: {
    data: Data.Users.Audit.Variants['forActivity'][]
    metadata: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
      firstPage: number
    }
  }
  events: AuditEvent[]
  q?: string
  actorId: number | null
  event: AuditEvent | null
}>

export default function ActivityPage({ audits, events, q, actorId, event }: PageProps) {
  const { t } = useTranslation()

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t('users.activity.page.breadcrumbs.users'), href: '/users' },
        { label: t('users.activity.page.breadcrumbs.activity') },
      ]}
    >
      <Head title={t('users.activity.page.title')} />
      <Main>
        <Heading
          title={t('users.activity.page.title')}
          description={t('users.activity.page.description')}
        />

        <div className="flex-1 overflow-auto px-1 py-1">
          <ActivityTable audits={audits} events={events} q={q} actorId={actorId} event={event} />
        </div>
      </Main>
    </AdminLayout>
  )
}
