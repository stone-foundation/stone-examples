import React from "react"
import { Send } from "lucide-react"

type SendButtonProps = {
  onClick: () => void
}

export const SendButton: React.FC<SendButtonProps> = ({ onClick }) => {
  return (
    <button
      className="p-2 rounded-full hover:bg-gray-500"
      onClick={onClick}
    >
      <Send />
    </button>
  )
}
