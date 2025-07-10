import { User } from "./User"
import { Team, TeamMember } from "./Team"

export type BadgeType = 'victory' | 'participation' | 'achievement' | 'creativity' | 'teamwork' | 'special'

export interface Badge {
  uuid: string
  author: User
  name: string
  color: string
  score: number
  type: BadgeType
  iconUrl?: string
  createdAt: number
  typeLabel: string
  updatedAt: number
  description: string
}

export interface BadgeTeam {
  team: Team
  uuid: string
  badge: Badge
  comment?: string
  issuedAt: number
  teamUuid: string
  badgeUuid: string
  member?: TeamMember
  memberUuid?: string
}

export interface BadgeAssignPayload {
  team: Team
  badge: Badge
  comment?: string
  member?: TeamMember
}