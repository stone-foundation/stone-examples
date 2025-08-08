import { User } from './User'
import { Badge } from './Badge'
import { Color } from '../constants'
import { Activity } from './Activity'

/**
 * Team Member Role Type
 */
export type TeamMemberRole = 'member' | 'captain' | 'admin'

/**
 * Team Interface
*/
export interface Team {
  uuid: string
  name: string
  color: Color
  rank?: number
  score?: number
  motto?: string
  rules?: string
  slogan?: string
  badges?: Badge[]
  logoUrl?: string
  chatLink?: string
  bannerUrl?: string
  totalMembers: number
  countMembers: number
  missionUuid: string
  description?: string
  captain?: TeamMember
  members: TeamMember[]
  countBadges?: number
  activities?: Activity[]
  countActivities?: number
  countPresences?: number
  scorePercentage?: number
}

/**
 * TeamStat Interface
*/
export interface TeamStat extends Omit<Team, 'members' | 'chatLink'> {}

/**
 * Team Member Interface
*/
export interface TeamMember {
  uuid: string
  name: string
  isLate: boolean
  leftAt?: number
  userUuid: string
  teamUuid: string
  joinedAt: number
  isActive: boolean
  isPresent: boolean
  isCaptain?: boolean
  missionUuid: string
  role: TeamMemberRole
  user: Partial<User>
  team: Partial<Team>
}
