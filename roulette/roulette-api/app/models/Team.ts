import { User } from "./User"
import { Badge } from "./Badge"
import { Activity } from "./Activity"

/**
 * Team Model Interface
*/
export interface TeamModel {
  uuid: string
  name: string
  rank: number
  score: number
  color?: string | null
  motto?: string | null
  rules?: string | null
  slogan?: string | null
  logoUrl?: string | null
  bannerUrl?: string | null
  createdAt: number
  updatedAt: number
  totalMembers: number
  countMembers: number
  countActivities: number
  countBadges: number
  missionUuid: string
  countPresences: number
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

export type TeamMemberRole = 'member' | 'captain' | 'admin'

export interface TeamMemberModel {
  uuid: string
  name: string
  isLate: boolean
  userUuid: string
  teamUuid: string
  joinedAt: number
  isActive: boolean
  isPresent: boolean
  missionUuid: string
  role: TeamMemberRole
  leftAt?: number | null
}

/**
 * Team Member Interface
*/
export interface TeamMember extends TeamMemberModel {
  user?: Partial<User>
  team?: Partial<Team>
}
