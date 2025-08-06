import { Team } from './Team'
import { User } from './User'

/**
 * Spin model Interface
*/
export interface SpinModel {
  uuid: string
  value: string
  userUuid: string
  teamUuid: string
  createdAt: number
  missionUuid: string
  color?: string | null
  teamMemberUuid: string
}

/**
 * Spin Interface
 */
export interface Spin extends SpinModel {
  user?: User
  team?: Team
}

/**
 * Spin Result Interface
 */
export interface SpinResult {
  color: string
}
