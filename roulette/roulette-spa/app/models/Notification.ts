import { Team } from "./Team"
import { User } from "./User"
import { Post } from "./Post"
import { Badge } from "./Badge"
import { Mission } from "./Mission"
import { Activity } from "./Activity"
import { ChatMessage } from "./Chatbot"

export interface Notification {
  id?: string
  type?: string
  message: string
  timestamp?: number
  error?: Error | Event
  user?: User
  posts?: Post[]
  teams?: Team[]
  badges?: Badge[]
  members?: User[]
  mission?: Mission
  chat?: ChatMessage[]
  activities?: Activity[]
}