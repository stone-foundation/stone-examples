import { JSX, ReactNode } from 'react'

interface AlertBoxProps {
  className?: string
  children: ReactNode
  variant?: 'error' | 'success' | 'info'
}

export const AlertBox = ({ children, variant = 'info', className = 'mb-4' }: AlertBoxProps): JSX.Element | undefined => {
  if (children === undefined) return

  const base = 'px-4 py-3 rounded-md text-sm border'
  const styles = {
    info: 'bg-white/5 text-white border-white/10',
    success: 'bg-green-500/10 text-green-300 border-green-500/20',
    error: 'bg-red-500/15 text-red-200 border-red-500/20'
  }

  return (
    <div className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </div>
  )
}
