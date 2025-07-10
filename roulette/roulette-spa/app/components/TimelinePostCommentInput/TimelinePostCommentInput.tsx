import { useState } from 'react'
import { User } from '../../models/User'
import { Avatar } from '../Avatar/Avatar'
import { SendHorizonalIcon } from 'lucide-react'

interface TimelinePostCommentInputProps {
  onSubmit: (comment: string) => void
  currentUser: User
  disabled?: boolean
}

export const TimelinePostCommentInput = ({
  onSubmit,
  currentUser,
  disabled = false,
}: TimelinePostCommentInputProps) => {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed.length === 0) return
    onSubmit(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 border border-white/10 rounded-md bg-white/5 mt-3">
      <Avatar size={32} name={currentUser.username} imageUrl={currentUser.avatarUrl} />
      <textarea
        rows={1}
        className="flex-1 resize-none rounded-md bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none"
        placeholder="Écrire un commentaire..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || value.trim().length === 0}
        className="p-2 rounded-md bg-orange-600 hover:bg-orange-700 transition disabled:opacity-50"
      >
        <SendHorizonalIcon className="text-white w-4 h-4" />
      </button>
    </div>
  )
}
