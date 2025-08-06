import React, { useEffect, useRef } from "react"
import { MessageCircleOff } from "lucide-react"
import { useChat } from "../../context/ChatContext"
import { ChatMessageItem } from "./ChatMessageItem"

export const ChatMessages: React.FC = () => {
  const { messages } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 relative">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 absolute inset-0 flex-col items-center justify-center gap-4 flex">
          <MessageCircleOff size={32} />
          Aucun message pour le moment
          <span className="text-sm">Commencez une conversation !</span>
        </div>
      )}
      {messages.map(msg => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}
      <div ref={scrollRef} />
    </div>
  )
}
