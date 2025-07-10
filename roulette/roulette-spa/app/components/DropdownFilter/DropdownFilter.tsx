import clsx from 'clsx'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface DropdownFilterOption {
  label: string
  value: string
}

interface DropdownFilterProps {
  label?: string
  className?: string
  placeholder?: string
  value: string | undefined
  options: DropdownFilterOption[]
  onChange: (value: string) => void
}

export const DropdownFilter = ({
  label,
  value,
  options,
  onChange,
  className = '',
  placeholder = 'Sélectionner...'
}: DropdownFilterProps) => {
  const [open, setOpen] = useState(false)

  const selectedLabel = options.find(o => o.value === value)?.label

  return (
    <div className={clsx('relative text-white', className)}>
      {label && <div className="text-sm mb-1">{label}</div>}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-white/10 px-4 py-2 rounded-md flex justify-between items-center hover:bg-white/20 transition"
      >
        <span>{selectedLabel ?? placeholder}</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-neutral-800 border border-white/10 rounded-md shadow-lg overflow-hidden">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={clsx(
                'w-full text-left px-4 py-2 hover:bg-white/10',
                value === option.value && 'bg-white/10'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
