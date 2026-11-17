import { Accordion } from '@/components/ui/Accordion'
import type { ItineraryDay } from '@/types/api'

export const Itinerary = ({ days }: { days: readonly ItineraryDay[] }) => (
  <Accordion
    multiple
    defaultOpen={days[0] ? [String(days[0].dayNumber)] : []}
    items={days.map((day) => ({
      id: String(day.dayNumber),
      title: (
        <span className="flex items-center gap-3">
          <span className="inline-flex shrink-0 items-center rounded-control bg-canvas-alt px-3 py-1 text-xs font-bold tracking-wide text-brand-text">
            Day {day.dayNumber}
          </span>
          {day.title}
        </span>
      ),
      content: <p className="whitespace-pre-line">{day.description}</p>,
    }))}
  />
)
