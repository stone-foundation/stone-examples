import React from 'react'

interface FormInputProps {
  name: string
  value: string
  className?: string
  maxLength?: number
  placeholder: string
  inputMode?: 'text' | 'numeric' | 'tel'
  type?: 'text' | 'tel' | 'password' | 'number'
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  value,
  onChange,
  inputMode,
  className,
  maxLength,
  placeholder,
  type = 'text'
}) => (
  <input
    name={name}
    type={type}
    value={value}
    onChange={onChange}
    inputMode={inputMode}
    maxLength={maxLength}
    placeholder={placeholder}
    className={`w-full p-3 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition ${className ?? ''}`}
  />
)
