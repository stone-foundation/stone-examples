import { JSX } from 'react'
import { Color, COLOR_MAP, COLOR_TITLES } from '../../constants'

interface TeamBadgeProps {
  color: Color
}

export const TeamBadge = ({ color }: TeamBadgeProps): JSX.Element => (
  <span
    className='text-xs font-semibold px-2 py-1 rounded-md text-white shadow'
    style={{ backgroundColor: COLOR_MAP[color] ?? '#555' }}
  >
    {COLOR_TITLES[color] ?? 'Aucune unité'}
  </span>
)
