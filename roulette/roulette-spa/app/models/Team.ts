import { Color } from '../constants'

/**
 * Team Interface
*/
export interface Team {
  name: string
  color: Color
  totalMember: number
  countMember: number
  members: TeamMember[]
}

/**
 * TeamStat Interface
*/
export interface TeamStat extends Omit<Team, 'members'> {}

/**
 * TeamMember Interface
*/
export interface TeamMember {
  fullname: string
  username: string
}
