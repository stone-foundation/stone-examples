import { JSX } from 'react'

interface FormButtonProps {
  disabled?: boolean
  className?: string
  onClick?: () => void
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
}

export const FormButton = ({
  onClick,
  children,
  type = 'button',
  className = '',
  disabled = false
}: FormButtonProps): JSX.Element => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
)
