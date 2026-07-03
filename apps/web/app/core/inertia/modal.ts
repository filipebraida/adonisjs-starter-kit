import type { HttpContext } from '@adonisjs/core/http'
import type { Backdrop, ModalProps, ModalResponse } from 'adonis-inertia-modal'

export function modal(
  inertia: HttpContext['inertia'],
  component: string,
  props: ModalProps,
  backdrop: Backdrop
): ModalResponse {
  const proxy = inertia as unknown as {
    modal(component: string, props: ModalProps, backdrop: Backdrop): ModalResponse
  }
  return proxy.modal(component, props, backdrop)
}
