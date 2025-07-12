import { Badge } from './Badge'
import { Color } from '../constants'
import { Activity } from './Activity'

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
  totalMember: number
  countMember: number
  description?: string
  captain?: TeamMember
  members: TeamMember[]
  countBadges?: number
  activities?: Activity[]
  countActivity?: number
  countPresence?: number
  scorePercentage?: number
}

/**
 * TeamStat Interface
*/
export interface TeamStat extends Omit<Team, 'members' | 'chatLink'> {}

/**
 * TeamMember Interface
*/
export interface TeamMember {
  uuid: string
  isLate?: boolean
  fullname: string
  username: string
  isPresent?: boolean
  isCaptain?: boolean
}
