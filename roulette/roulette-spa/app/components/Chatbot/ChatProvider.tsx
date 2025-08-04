import { Chatbox } from "./Chatbox"
import { ChatMessage } from "../../models/Chatbot"
import { ChatContext } from "../../context/ChatContext"
import { ChatService } from "../../services/ChatService"
import { useAudioRecorder } from "../../hooks/useAudioRecorder"
import { useState, useCallback, useMemo, useEffect } from "react"
import { EventEmitter, IContainer, isEmpty } from "@stone-js/core"
import { NotificationEvent } from "../../events/NotificationEvent"

export interface ChatProviderProps {
  container: IContainer
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ container }) => {
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const { isRecording, startRecording, stopRecording } = useAudioRecorder()
  
  const chatService = container.make<ChatService>(ChatService)
  const eventEmitter = container.make<EventEmitter>(EventEmitter)

  const sendMessage = useCallback(async (content: string) => {
    if (isEmpty(content)) return

    const newMessage: ChatMessage = {
      content,
      role: "user",
      createdAt: Date.now(),
      id: crypto.randomUUID(),
    }
    setMessages(prev => [...prev, newMessage])

    await chatService.create({ content })
  }, [])

  const sendAudio = useCallback(async (file: File) => {
    const audioUrl = URL.createObjectURL(file)
    const newMessage: ChatMessage = {
      audioUrl,
      content: "",
      role: "user",
      createdAt: Date.now(),
      id: crypto.randomUUID(),
    }
    
    setMessages(prev => [...prev, newMessage])

    await chatService.create({}, file)
  }, [])

  const contextValue = useMemo(() => ({
    messages,
    isTyping,
    sendAudio,
    sendMessage,
    isRecording,
    stopRecording,
    startRecording
  }), [messages, isRecording, isTyping, sendMessage, sendAudio, startRecording, stopRecording])

  useEffect(() => {
    const handleTypingNotification = () => {
      setIsTyping(true)
    }
    const handleChatNotification = (event: NotificationEvent) => {
      setIsTyping(false)
      for (const chatMessage of event.notification.chat ?? []) {
        setMessages(prev => [...prev, chatMessage])
      }
    }

    chatService.list(100).then(initialMessages => {
      setMessages(initialMessages.items)
    })

    eventEmitter.on(NotificationEvent.CHAT_MESSAGE, handleChatNotification)
    eventEmitter.on(NotificationEvent.CHAT_TYPING, handleTypingNotification)

    return () => {
      eventEmitter.off(NotificationEvent.CHAT_MESSAGE, handleChatNotification)
      eventEmitter.off(NotificationEvent.CHAT_TYPING, handleTypingNotification)
    }
  }, [eventEmitter])

  return (
    <ChatContext.Provider value={contextValue}>
      <Chatbox />
    </ChatContext.Provider>
  )
}