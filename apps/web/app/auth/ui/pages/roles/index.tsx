// useForm and not <Form>: unticking every capability must still send `capabilities: []`,
// and FormData drops the key when no checkbox is ticked.
import { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import { ModalLink } from 'adonis-inertia-modal/react'
import { AlertTriangle, ShieldPlus } from 'lucide-react'

import { Badge } from '@workspace/ui/components/badge'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { FieldError } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'

import { urlFor } from '~/app/client'
import type { InertiaProps } from '#core/ui/app/types'
import AdminLayout from '#core/ui/components/admin_layout'
import { ConfirmDialog } from '#core/ui/components/confirm_dialog'
import Heading from '#core/ui/components/heading'
import { Main } from '#core/ui/components/main'
import { useTranslation } from '#core/ui/hooks/use_translation'

import type { RoleInMatrix } from '#auth/queries/roles_matrix'
import {
  byDomain,
  capabilityLabel,
  domainLabel,
  roleDescription,
  roleName,
} from '#auth/ui/components/role_labels'

type PageProps = InertiaProps<{
  roles: RoleInMatrix[]
  vocabulary: string[]
}>

export default function RolesPage({ roles, vocabulary }: PageProps) {
  const { t } = useTranslation()

  return (
    <AdminLayout breadcrumbs={[{ label: t('auth.roles.title') }]}>
      <Head title={t('auth.roles.title')} />
      <Main>
        <Heading title={t('auth.roles.title')} description={t('auth.roles.description')}>
          <ModalLink href={urlFor('roles.create')} className={buttonVariants({ size: 'sm' })}>
            <span>{t('auth.roles.create.submit')}</span>
            <ShieldPlus size={18} />
          </ModalLink>
        </Heading>

        <div className="space-y-4 py-1">
          {roles.map((role) => (
            <RoleCard key={role.name} role={role} vocabulary={vocabulary} />
          ))}
        </div>
      </Main>
    </AdminLayout>
  )
}

function RoleCard({ role, vocabulary }: { role: RoleInMatrix; vocabulary: string[] }) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className={role.structural ? undefined : 'font-mono'}>
            {roleName(t, role.name)}
          </span>
          <Badge variant={role.structural ? 'secondary' : 'outline'}>
            {role.structural ? t('auth.roles.structural') : t('auth.roles.institutional')}
          </Badge>
        </CardTitle>
        <CardAction>
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {t('auth.roles.members', { total: role.members })}
            </span>
            {!role.structural && !editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                {t('auth.roles.edit')}
              </Button>
            )}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        {editing ? (
          <EditCapabilities role={role} vocabulary={vocabulary} onClose={() => setEditing(false)} />
        ) : (
          <ReadCapabilities role={role} />
        )}
      </CardContent>
    </Card>
  )
}

function ReadCapabilities({ role }: { role: RoleInMatrix }) {
  const { t } = useTranslation()

  return (
    <>
      {role.structural && (
        <p className="mb-3 text-sm text-muted-foreground">
          {roleDescription(t, role.name)} {t('auth.roles.in_code')}
        </p>
      )}
      {role.capabilities.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('auth.roles.no_capabilities')}</p>
      ) : (
        <div className="space-y-3">
          {byDomain(role.capabilities).map(([domain, capabilities]) => (
            <div key={domain}>
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                {domainLabel(t, domain)}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {capabilities.map((capability) => (
                  <Badge key={capability} variant="outline" title={capability}>
                    {capabilityLabel(t, capability)}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function EditCapabilities({
  role,
  vocabulary,
  onClose,
}: {
  role: RoleInMatrix
  vocabulary: string[]
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { data, setData, put, processing, errors } = useForm<{ capabilities: string[] }>({
    capabilities: role.capabilities,
  })

  function toggle(capability: string, checked: boolean) {
    setData(
      'capabilities',
      checked
        ? [...data.capabilities, capability]
        : data.capabilities.filter((item) => item !== capability)
    )
  }

  return (
    <div className="space-y-4">
      {byDomain(vocabulary).map(([domain, capabilities]) => (
        <fieldset key={domain}>
          <legend className="mb-1 text-xs font-medium text-muted-foreground">
            {domainLabel(t, domain)}
          </legend>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <label
                key={capability}
                className="flex items-center gap-2 text-sm"
                title={capability}
              >
                <Checkbox
                  checked={data.capabilities.includes(capability)}
                  onCheckedChange={(checked) => toggle(capability, checked === true)}
                />
                {capabilityLabel(t, capability)}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {errors.capabilities && <FieldError>{errors.capabilities}</FieldError>}

      <div className="flex items-center gap-2 border-t pt-3">
        <Button
          type="button"
          size="sm"
          disabled={processing}
          onClick={() =>
            put(urlFor('roles.update', { id: role.name }), {
              preserveScroll: true,
              onSuccess: onClose,
            })
          }
        >
          {t('auth.roles.save')}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t('auth.roles.cancel')}
        </Button>
        <DeleteRole role={role} />
      </div>
    </div>
  )
}

function DeleteRole({ role }: { role: RoleInMatrix }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const hasMembers = role.members > 0

  return (
    <div className="ml-auto flex items-center gap-2">
      {hasMembers && (
        <span className="text-xs text-muted-foreground">
          {t('auth.roles.delete_blocked', { total: role.members })}
        </span>
      )}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={hasMembers}
        onClick={() => setOpen(true)}
      >
        {t('auth.roles.delete')}
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setTyped('')
        }}
        destructive
        disabled={typed.trim() !== role.name}
        cancelBtnText={t('auth.roles.cancel')}
        confirmText={t('auth.roles.delete')}
        handleConfirm={() => router.delete(urlFor('roles.destroy', { id: role.name }))}
        title={
          <span className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="mr-1 inline-block stroke-destructive" size={18} />
            <span>{t('auth.roles.delete')}</span>
          </span>
        }
        desc={
          <div className="space-y-3">
            <p>{t('auth.roles.delete_confirm', { role: role.name })}</p>
            <Input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={role.name}
              aria-label={t('auth.roles.delete_type', { role: role.name })}
            />
            <p className="text-xs text-muted-foreground">
              {t('auth.roles.delete_type', { role: role.name })}
            </p>
          </div>
        }
      />
    </div>
  )
}
