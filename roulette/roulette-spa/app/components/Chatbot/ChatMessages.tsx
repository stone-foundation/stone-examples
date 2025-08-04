import React, { useEffect, useRef } from "react"
import { useChat } from "../../context/ChatContext"
import { ChatMessageItem } from "./ChatMessageItem"

export const ChatMessages: React.FC = () => {
  const { messages } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.map(msg => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}
      <div ref={scrollRef} />
    </div>
  )
}
