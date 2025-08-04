import React from "react"
import { Mic, Square } from "lucide-react"

type MicButtonProps = {
  isRecording: boolean
  onStart: () => void
  onStop: () => void
}

export const MicButton: React.FC<MicButtonProps> = ({ isRecording, onStart, onStop }) => {
  return (
    <button
      className="p-2 rounded-full hover:bg-gray-500"
      onClick={isRecording ? onStop : onStart}
    >
      {isRecording ? <Square className="text-red-500" /> : <Mic />}
    </button>
  )
}
