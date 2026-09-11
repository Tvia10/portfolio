import { formatRange } from '../lib/format'

interface Item {
  id: number
  title: string
  place: string
  start_date: string
  end_date: string | null
  description: string
}

export function Timeline({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Nothing here yet.</p>
  }

  return (
    <ol className="relative border-l border-line pl-6">
      {items.map((item) => (
        <li key={item.id} className="mb-9 last:mb-0">
          <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-ink" />
          <p className="text-xs uppercase tracking-wide text-muted">
            {formatRange(item.start_date, item.end_date)}
          </p>
          <h3 className="mt-1 font-semibold text-ink">{item.title}</h3>
          <p className="text-sm text-muted">{item.place}</p>
          {item.description && (
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
          )}
        </li>
      ))}
    </ol>
  )
}
