import clsx from "clsx"
import { EventEmitter } from "@stone-js/core"
import { RecordingWaves } from "./RecordingWaves"
import { StoneContext } from "@stone-js/use-react"
import { PauseCircle, PlayCircle } from "lucide-react"
import { NotificationEvent } from "../../events/NotificationEvent"
import React, { useContext, useEffect, useRef, useState } from "react"


type AudioMessageProps = {
  isUser: boolean
  audioUrl: string
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export const AudioMessage: React.FC<AudioMessageProps> = ({ audioUrl, isUser }) => {
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const container = useContext(StoneContext).container
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const eventEmitter = container.make<EventEmitter>(EventEmitter)

  // Charger la durée audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current?.duration || 0)
      }
    }
  }, [audioUrl])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      eventEmitter
        .emit(new NotificationEvent(NotificationEvent.STOP_ALL_AUDIO, { message: 'Stopping all audio playback' }))
        .then(() => {
          audioRef.current?.play()
        })
    }
  }

  // Gérer lecture / pause / progression
  useEffect(() => {
    if (!audioRef.current) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current?.currentTime || 0)
    }
    const handleStopAll = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }

    audioRef.current.addEventListener("play", handlePlay)
    audioRef.current.addEventListener("pause", handlePause)
    audioRef.current.addEventListener("ended", handleEnded)
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
    eventEmitter.on(NotificationEvent.STOP_ALL_AUDIO, handleStopAll)

    return () => {
      audioRef.current?.removeEventListener("play", handlePlay)
      audioRef.current?.removeEventListener("pause", handlePause)
      audioRef.current?.removeEventListener("ended", handleEnded)
      eventEmitter.off(NotificationEvent.STOP_ALL_AUDIO, handleStopAll)
      audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [])

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex flex-col gap-1 w-[200px]">
      <div className="flex items-center gap-3">
        <button onClick={togglePlay}>
          {isPlaying ? <PauseCircle size={32} color={isUser ? "white" : "blue"} /> : <PlayCircle size={32} color={isUser ? "white" : "blue"} />}
        </button>
        <div className="w-full h-1 bg-gray-300 rounded overflow-hidden">
          <div
            className={clsx("h-1", isUser ? "bg-white" : "bg-blue-500")}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {isPlaying ? (
          <RecordingWaves className={isUser ? "text-white" : "text-blue-500"} />
        ) : (
          <span className="text-xs opacity-80">
            {duration > 0 ? formatTime(duration) : "--:--"}
          </span>
        )}
      </div>
      <audio ref={audioRef} src={audioUrl} preload="metadata">
        <track kind="captions" srcLang="en" label="English captions" />
      </audio>
    </div>
  )
}
