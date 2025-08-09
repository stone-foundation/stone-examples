import { User } from './User'
import { Team, TeamMember } from './Team'

export interface BadgeModel {
  uuid: string
  name: string
  color: string
  score: number
  iconUrl?: string | null
  category: string
  createdAt: number
  updatedAt: number
  description: string
  missionUuid: string
  categoryLabel: string
  maxAssignments: number
  expirationDays?: number | null
  visibility: 'public' | 'private'
}

export interface Badge extends BadgeModel {}

export interface BadgeAssignmentModel {
  uuid: string
  issuedAt: number
  revoked: boolean
  missionUuid: string
  issuedByUuid: string
  comment?: string | null
  revokedBy?: User | null
  badgeUuid: string
  teamUuid?: string | null
  revokedAt?: number | null
  teamMemberUuid?: string | null
  origin: 'manual' | 'system' | 'event'
}

export interface BadgeAssignment extends BadgeAssignmentModel {
  team?: Team
  badge: Badge
  issuedBy: User
  teamMember?: TeamMember
}
