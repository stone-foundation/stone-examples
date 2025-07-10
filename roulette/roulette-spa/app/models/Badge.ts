import { Team } from "./Team"
import { User } from "./User"

export interface Badge {
  uuid: string
  author: User
  name: string
  score?: number
  iconUrl?: string
  createdAt: number
  updatedAt?: number
  description: string
}

export interface BadgeTeam extends Badge {
  team: Team
  issuedAt: number
}