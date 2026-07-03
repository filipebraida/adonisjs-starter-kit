import { useState, type ComponentProps, type ReactNode } from 'react'
import { Modal } from 'adonis-inertia-modal/react'

import { PortalContainerProvider } from '@workspace/ui/hooks/use-portal-container'

type ModalProps = ComponentProps<typeof Modal>
type ModalChildFn = Exclude<ModalProps['children'], ReactNode>
type ModalArgs = Parameters<ModalChildFn>[0]

interface AppModalProps extends Omit<ModalProps, 'children'> {
  children: ReactNode | ((args: ModalArgs) => ReactNode)
}

export function AppModal({ children, ...modalProps }: AppModalProps) {
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)

  return (
    <Modal {...modalProps}>
      {(args) => (
        <div ref={setPanel}>
          <PortalContainerProvider container={panel}>
            {typeof children === 'function' ? children(args) : children}
          </PortalContainerProvider>
        </div>
      )}
    </Modal>
  )
}
