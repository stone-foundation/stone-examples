import { JSX } from 'react'

interface TeamStatsPanelProps {
  length: number
}

/**
 * Skeleton version of the TeamPanel while loading.
 */
export const TeamPanelSkeleton = ({ length }: TeamStatsPanelProps): JSX.Element => (
  <aside className='w-full mt-6 sm:w-64 sm:mt-0 rounded-lg p-4 text-white shadow-md bg-neutral-800 animate-pulse'>
    <div className='h-5 w-2/3 mx-auto rounded bg-neutral-600 mb-6' />

    <div>
      <div className='h-4 w-1/2 bg-neutral-700 rounded mb-3' />

      <ul className='space-y-2 mb-6'>
        {Array.from({ length }).map(v => `item-${String(v)}`).map((v) => (
          <li key={v} className='h-6 w-full rounded-md bg-neutral-700' />
        ))}
      </ul>
    </div>

    <div className='h-9 w-full rounded-md bg-neutral-700' />
  </aside>
)
