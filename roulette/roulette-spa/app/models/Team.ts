import { BadgeTeam } from './Badge'
import { Color } from '../constants'

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
  logoUrl?: string
  chatLink?: string
  bannerUrl?: string
  totalMember: number
  countMember: number
  description?: string
  captain?: TeamMember
  members: TeamMember[]
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

export interface TeamsAsideStats {
  teams: Team[]
  badges: BadgeTeam[]
  total: {
    presence: number
    members: number
    posts: number
    badges: number
  }
}