import { User } from "./User"
import { Team, TeamMember } from "./Team"

export type BadgeType = 'victory' | 'participation' | 'achievement' | 'creativity' | 'teamwork' | 'special'
export interface Badge {
  uuid: string
  name: string
  color: string
  score: number
  iconUrl?: string
  category: string
  createdAt: number
  updatedAt: number
  description: string
  missionUuid: string
  categoryLabel: string
  maxAssignments: number
  expirationDays?: number
  visibility: 'public' | 'private'

  activityUuid?: string
}

export interface BadgeAssignPayload {
  team: Team
  badge: Badge
  comment?: string
  member?: TeamMember
}

export interface BadgeAssignment {
  uuid: string
  issuedAt: number
  revoked: boolean
  missionUuid: string
  issuedByUuid: string
  comment?: string
  revokedBy?: User
  badgeUuid: string
  teamUuid?: string
  revokedAt?: number
  teamMemberUuid?: string
  origin: 'manual' | 'system' | 'event'
  team?: Team
  badge: Badge
  issuedBy: User
  teamMember?: TeamMember
}