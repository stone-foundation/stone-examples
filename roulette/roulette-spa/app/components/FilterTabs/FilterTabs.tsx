import { JSX } from 'react'

export interface FilterTabsProps {
  value: string
  onChange: (value: string) => void
}

const FILTERS = [
  { label: 'Tous', value: 'all' },
  { label: 'Sans unité', value: 'no-team' },
  { label: 'Avec unité', value: 'with-team' },
  { label: 'Rubis', value: 'red' },
  { label: 'Topaze', value: 'blue' },
  { label: 'Ambre', value: 'orange' },
  { label: 'Emeraude', value: 'green' },
  { label: 'Saphir', value: 'blue_dark' }
]

export const FilterTabs = ({ value, onChange }: FilterTabsProps): JSX.Element => {
  const classFn = (filter: typeof FILTERS[0]): string => {
    let initial = 'whitespace-nowrap text-sm px-4 py-2 rounded-md border transition font-medium '
    initial += value === filter.value
      ? 'bg-orange-600 border-orange-700 text-white'
      : 'bg-neutral-800 border-neutral-700 text-white/70 hover:bg-neutral-700'
    return initial
  }

  return (
    <div className='w-full overflow-x-auto'>
      <div className='flex flex-wrap gap-2 bg-[#16414c] rounded-md p-2'>
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={classFn(filter)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
