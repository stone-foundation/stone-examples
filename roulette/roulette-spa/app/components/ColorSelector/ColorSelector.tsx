import clsx from 'clsx'
import { Color } from '../../constants'

interface ColorSelectorProps {
  selected?: Color
  onSelect: (color: Color) => void
  colors: Array<{ name: Color, value: string }>
}

export const ColorSelector = ({ colors, selected, onSelect }: ColorSelectorProps) => {
  return (
    <div className="flex gap-2 mt-2">
      {colors.map((color) => (
        <button
          key={color.name}
          onClick={() => onSelect(color.name)}
          className={clsx('w-6 h-6 rounded-full border-2 transition', selected === color.name ? 'ring-2 ring-white scale-110' : 'opacity-70')}
          style={{ backgroundColor: color.value }}
        />
      ))}
    </div>
  )
}
