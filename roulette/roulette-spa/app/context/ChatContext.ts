import { createContext, useContext } from "react";
import { ChatContextType } from "../models/Chatbot";

export const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) throw new Error("useChat must be used within ChatProvider")
  return context
}