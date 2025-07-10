import { TextareaHTMLAttributes } from 'react'

type PostTextInputProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value' | 'placeholder'> & {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const PostTextInput = ({
  value,
  onChange,
  placeholder = 'Exprime-toi...',
  ...rest
}: PostTextInputProps) => {
  return (
    <textarea
      className="w-full min-h-[100px] resize-none rounded-lg bg-white/5 text-white placeholder-white/50 p-4 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      {...rest}
    />
  )
}
