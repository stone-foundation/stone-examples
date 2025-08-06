import { useRef, useState, useCallback } from "react"

export const useAudioRecorder = () => {
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const startRecording = useCallback(async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(streamRef.current)

      chunksRef.current = []

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
    } catch (error) {
      console.error("Erreur d'accès au micro :", error)
    }
  }, [])

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return resolve(new Blob())

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        setIsRecording(false)
        resolve(audioBlob)
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      mediaRecorderRef.current.stop()
    })
  }, [])

  return {
    isRecording,
    stopRecording,
    startRecording
  }
}
