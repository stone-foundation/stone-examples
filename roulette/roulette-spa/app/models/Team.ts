import { Color } from '../constants'

/**
 * Team Interface
*/
export interface Team {
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
  fullname: string
  username: string
}
