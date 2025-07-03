import { JSX } from 'react'

interface TeamStatsPanelProps {
  length: number
}

/**
 * Skeleton version of the TeamStatsPanel while loading.
 */
export const TeamStatsPanelSkeleton = ({ length }: TeamStatsPanelProps): JSX.Element => (
  <aside className='w-full sm:w-64 bg-neutral-900 p-4 rounded-lg border border-neutral-800 text-white animate-pulse'>
    <h2 className='text-lg font-semibold mb-4 uppercase text-center'>Unités</h2>
    <ul className='space-y-3'>
      {Array.from({ length }).map(v => `item-${String(v)}`).map((v) => (
        <li
          key={v}
          className='flex justify-between items-center px-3 py-2 rounded-md bg-neutral-700'
        >
          <div className='h-4 w-1/3 bg-neutral-500 rounded' />
          <div className='h-4 w-1/4 bg-neutral-600 rounded' />
        </li>
      ))}
    </ul>
  </aside>
)
