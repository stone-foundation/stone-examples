import { ChatInput } from "./ChatInput"
import { ChatHeader } from "./ChatHeader"
import { ChatMessages } from "./ChatMessages"
import { MessageCircleMore } from "lucide-react"
import { StoneContext } from "@stone-js/use-react"
import { useChat } from "../../context/ChatContext"
import React, { useContext, useState } from "react"
import { ChatMessageService } from "../../services/ChatMessageService"

export const Chatbox: React.FC = () => {
  const { setMessages } = useChat()
  const [isClosed, setIsClosed] = useState(true)
  const container = useContext(StoneContext).container
  const chatMessageService = container.make<ChatMessageService>(ChatMessageService)

  const handleDeleteAll = () => {
    chatMessageService.deleteAll().then(() => {
      setMessages([])
    })
  }

  return isClosed ? (
    <button
      className="fixed bottom-4 right-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
      onClick={() => setIsClosed(false)}
    >
      <MessageCircleMore size={24} />
    </button>
  ) : (
    <div className="fixed inset-0 z-55 h-full w-full max-h-screen md:bottom-1 md:right-4 md:inset-auto md:h-[700px] md:w-full md:max-w-lg flex flex-col border rounded-none md:rounded-lg bg-white shadow-lg overflow-hidden">
      <ChatHeader title="Samba Chat" onClose={() => setIsClosed(true)} onClear={handleDeleteAll} />
      <ChatMessages />
      <ChatInput />
    </div>
  )
}
