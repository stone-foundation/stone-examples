interface GlobalStats {
  totalPosts: number
  totalBadges: number
  totalMembers: number
  totalPresence: number
}

interface GlobalStatsCardProps {
  readonly stats: GlobalStats
}

export function GlobalStatsCard({ stats }: GlobalStatsCardProps) {
  const items = [
    { label: 'Membres', value: stats.totalMembers },
    { label: 'Présents', value: stats.totalPresence },
    { label: 'Publications', value: stats.totalPosts },
    { label: 'Badges décernés', value: stats.totalBadges },
  ]

  return (
    <ul className="grid grid-cols-2 gap-4">
      {items.map(({ label, value }) => (
        <li
          key={label}
          className="bg-white/5 border border-white/10 rounded-md p-3 flex flex-col text-white text-sm"
        >
          <span className="text-xs text-white/60">{label}</span>
          <span className="font-semibold text-base">{value}</span>
        </li>
      ))}
    </ul>
  )
}
