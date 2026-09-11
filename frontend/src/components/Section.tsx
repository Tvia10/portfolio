import type { ReactNode } from 'react'

interface Props {
  id: string
  title: string
  eyebrow?: string
  subtitle?: string
  children: ReactNode
}

export function Section({ id, title, eyebrow, subtitle, children }: Props) {
  return (
    <section id={id} className="mx-auto w-full max-w-5xl px-5 py-20">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
        {eyebrow && <span className="pb-1 text-sm text-muted">{eyebrow}</span>}
      </div>
      {subtitle && <p className="mt-3 max-w-2xl text-muted">{subtitle}</p>}
      <div className="mt-10">{children}</div>
    </section>
  )
}
