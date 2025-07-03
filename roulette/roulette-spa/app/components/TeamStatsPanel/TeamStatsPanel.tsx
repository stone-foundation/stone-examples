import { JSX } from 'react'
import { COLOR_MAP } from '../../constants'
import { TeamStat } from '../../models/Team'

/**
 * Props for the TeamStatsPanel component.
 */
export interface TeamStatsPanelProps {
  stats: TeamStat[]
}

/**
 * TeamStatsPanel component displays a list of color statistics.
 */
export const TeamStatsPanel = ({ stats }: TeamStatsPanelProps): JSX.Element => (
  <aside className='w-full sm:w-64 bg-neutral-900 p-4 rounded-lg border border-neutral-800 text-white'>
    <h2 className='text-lg font-semibold mb-4 uppercase text-center'>Unités</h2>
    <ul className='space-y-3'>
      {stats.map(({ color, name, countMember, totalMember }) => (
        <li
          key={color}
          style={{ backgroundColor: COLOR_MAP[color] ?? '#555' }}
          className='flex justify-between items-center px-3 py-2 rounded-md text-white'
        >
          <span className='capitalize'>{name}</span>
          <span className='text-sm text-white'>{countMember}/{totalMember}</span>
        </li>
      ))}
    </ul>
  </aside>
)
