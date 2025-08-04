import { ChatInput } from "./ChatInput"
import { ChatHeader } from "./ChatHeader"
import { ChatMessages } from "./ChatMessages"
import { MessageCircleMore } from "lucide-react"
import { StoneContext } from "@stone-js/use-react"
import React, { useContext, useState } from "react"
import { ChatService } from "../../services/ChatService"

export const Chatbox: React.FC = () => {
  const [isClosed, setIsClosed] = useState(true)
  const container = useContext(StoneContext).container
  const chatService = container.make<ChatService>(ChatService)

  const handleDeleteAll = () => {
    chatService.deleteAll().catch((error) => {
      console.error("Error deleting all messages:", error)
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
    <div className="fixed bottom-1 right-4 flex flex-col w-full max-w-lg border rounded-lg bg-white shadow-lg overflow-hidden h-[700px]">
      <ChatHeader title="Samba Chat" onClose={() => setIsClosed(true)} onClear={handleDeleteAll} />
      <ChatMessages />
      <ChatInput />
    </div>
  )
}
