import { ReactNode } from 'react'

interface StatsSectionProps {
  readonly title: string
  readonly moreLink?: string
  readonly children: ReactNode
}

export function StatsSection({ title, children, moreLink }: StatsSectionProps) {
  return (
    <section className="mb-6 bg-white/5 rounded-xl p-4 shadow-sm border border-white/10">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase">{title}</h2>
        {moreLink && (
          <a href={moreLink} className="text-xs text-orange-400 hover:underline">
            Voir plus
          </a>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
