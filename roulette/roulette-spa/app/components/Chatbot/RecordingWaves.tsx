import clsx from "clsx"
import React from "react"

type RecordingWavesProps = {
  className?: string
}

export const RecordingWaves: React.FC<RecordingWavesProps> = ({ className }) => {
  return (
    <div className={clsx("flex items-end gap-[2px] h-5", className)}>
      <span className="w-[3px] bg-white animate-wave1 rounded"></span>
      <span className="w-[3px] bg-white animate-wave2 rounded"></span>
      <span className="w-[3px] bg-white animate-wave3 rounded"></span>
    </div>
  )
}
