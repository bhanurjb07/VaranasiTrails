import { Info } from 'lucide-react'

/** Shown on screens that have no server yet. */
export const PreviewNotice = () => (
  <div className="mb-5 flex items-start gap-3 rounded-lg border border-brand/30 bg-info-soft px-4 py-3 text-sm text-ink" role="note">
    <Info className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
    <p>
      <strong>Front end only for now.</strong> What you enter here is saved in this browser and is not sent to the server yet. It
      will connect to the server when the endpoints are ready.
    </p>
  </div>
)
