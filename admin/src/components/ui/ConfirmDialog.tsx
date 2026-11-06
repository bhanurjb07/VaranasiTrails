import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  children: ReactNode
  confirmLabel?: string
  /** Red button for destructive actions. */
  danger?: boolean
  loading?: boolean
}

/** Asks before anything destructive. */
export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={onClose} title={title} className="max-w-md">
    <div className="flex gap-3">
      {danger && <TriangleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />}
      <div className="text-sm text-muted">{children}</div>
    </div>
    <div className="mt-6 flex justify-end gap-3">
      <Button variant="outline" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
)
