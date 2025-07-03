import { Team } from './Team'
import { User } from './User'

/**
 * Bet model Interface
*/
export interface BetModel {
  uuid: string
  value: number
  color: string
  userUuid: string
  teamUuid: string
  createdAt: number
}

/**
 * Bet Interface
 */
export interface Bet extends BetModel {
  user?: User
  team?: Team
}

/**
 * Spin Result Interface
 */
export interface SpinResult {
  color: string
}