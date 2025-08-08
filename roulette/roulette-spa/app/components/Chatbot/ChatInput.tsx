import clsx from "clsx"
import { MicButton } from "./MicButton"
import { SendButton } from "./SendButton"
import { EventEmitter } from "@stone-js/core"
import { Mic, Send, Trash2 } from "lucide-react"
import { RecordingWaves } from "./RecordingWaves"
import { StoneContext } from "@stone-js/use-react"
import { useChat } from "../../context/ChatContext"
import React, { useContext, useState } from "react"
import { NotificationEvent } from "../../events/NotificationEvent"

export const ChatInput: React.FC = () => {
  const [text, setText] = useState("")
  const container = useContext(StoneContext).container
  const eventEmitter = container.make<EventEmitter>(EventEmitter)
  const { sendMessage, sendAudio, startRecording, stopRecording, isRecording } = useChat()

  const handleSend = () => {
    if (!text.trim()) return
    sendMessage(text)
    setText("")
  }

  const handleStopRecording = () => {
    stopRecording().then(audioBlob => {
      if (audioBlob.size > 0) {
        console.log("Enregistrement terminé")
        const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: "audio/webm" })
        sendAudio(audioFile)
      }
    })
  }

  const handleCancelRecording = () => {
    console.log("Enregistrement annulé")
    stopRecording().catch(error => {
      console.error("Erreur lors de l'annulation de l'enregistrement :", error)
    })
  }

  const handleStartRecording = () => {
    eventEmitter
      .emit(new NotificationEvent(NotificationEvent.STOP_ALL_AUDIO, { message: 'Stopping all audio playback' }))
      .catch(error => {
        console.error("Erreur lors de l'arrêt de la lecture audio :", error)
      })
    setText("")
    console.log("Enregistrement audio démarré")
    startRecording().catch(error => {
      console.error("Erreur lors du démarrage de l'enregistrement :", error)
    })
  }

  return (
    <div className={clsx("flex items-center gap-2 p-3 border-t bg-gray-600", { "bg-red-500 animate-pulse": isRecording })}>
      {isRecording ? (
        <div className="flex items-center justify-between flex-1 text-white pl-3">
          <div className="flex items-center gap-3">
            <Mic className="animate-pulse" size={18} />
            <span>Enregistrement en cours...</span>
            <RecordingWaves />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelRecording}
              className="p-2 rounded-full hover:bg-gray-300"
            >
              <Trash2 />
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-300"
              onClick={handleStopRecording}
            >
              <Send />
            </button>
          </div>
        </div>
      ) : (
        <>
          <textarea
            className="flex-1 border rounded resize-none px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Écrire un message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
          />
          <MicButton
            isRecording={isRecording}
            onStop={handleStopRecording}
            onStart={handleStartRecording}
          />
          <SendButton onClick={handleSend} />
        </>
      )}
    </div>
  )
}
