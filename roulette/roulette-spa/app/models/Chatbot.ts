import { Team } from "./Team"
import { User } from "./User"
import { Post } from "./Post"
import { Badge } from "./Badge"
import { Mission } from "./Mission"
import { Activity } from "./Activity"

export interface ChatMessage {
  id: string
  content: string
  createdAt: number
  audioUrl?: string
  steps?: ChatMessageStep[]
  role: "user" | "assistant" | "system"
}

export interface ChatMessageStep {
  id: string
  content: string
  post: Post[]
  users: User[]
  teams?: Team[]
  badges?: Badge[]
  members?: User[]
  missions?: Mission[]
  activities?: Activity[]
}

export interface ChatContextType {
  isTyping: boolean
  isRecording: boolean
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  sendAudio: (file: File) => void
  stopRecording: () => Promise<Blob>
  startRecording: () => Promise<void>
  sendMessage: (content: string) => void
}