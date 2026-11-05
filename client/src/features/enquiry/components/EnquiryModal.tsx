import { Modal } from '@/components/ui/Modal'
import { EnquiryForm } from './EnquiryForm'

interface EnquiryModalProps {
  open: boolean
  onClose: () => void
  destination: { id: string; title: string }
}

export const EnquiryModal = ({ open, onClose, destination }: EnquiryModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Send an enquiry"
    description={`About: ${destination.title}`}
    className="max-w-xl"
  >
    <EnquiryForm destination={destination} />
  </Modal>
)
