import { User } from './User'

/**
 * Team Model Interface
*/
export interface TeamModel {
  uuid: string
  name: string
  color: string
  chatLink?: string | null
  createdAt: number
  updatedAt: number
  totalMember: number
  countMember: number
}

/**
 * Team Interface
*/
export interface Team extends TeamModel {
  members: Array<Partial<User>>
}
