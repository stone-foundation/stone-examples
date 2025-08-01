import { Badge } from "./Badge"
import { Activity } from "./Activity"

/**
 * Team Model Interface
*/
export interface TeamModel {
  uuid: string
  name: string
  rank: number
  color: string
  score: number
  motto?: string | null
  rules?: string | null
  slogan?: string | null
  logoUrl?: string | null
  bannerUrl?: string | null
  createdAt: number
  updatedAt: number
  totalMember: number
  countMember: number
  countActivity: number
  countBadges: number
  countPresence: number
  scorePercentage?: number
  chatLink?: string | null
  description?: string | null
  captainUuid?: string | null
}

/**
 * Team Interface
*/
export interface Team extends TeamModel {
  badges?: Badge[]
  captain?: TeamMember
  members: TeamMember[]
  activities?: Activity[]
}

/**
 * Team Member Interface
*/
export interface TeamMember {
  uuid: string
  phone?: string
  isLate?: boolean
  fullname: string
  username: string
  isSoldier?: boolean
  isCaptain?: boolean
  isPresent?: boolean
}
