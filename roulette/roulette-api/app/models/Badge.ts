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
  authorUuid: string
  description: string
  categoryLabel: string
  maxAssignments: number
  expirationDays?: number | null
  visibility: 'public' | 'private' | string
}

export interface Badge extends BadgeModel {
  author?: User
  activityUuid?: string
}

export interface BadgeAssignmentModel {
  uuid: string
  issuedAt: number
  revoked: boolean
  issuedByUuid: string
  comment?: string | null
  revokedBy?: User | null
  badgeUuid: string
  teamUuid?: string | null
  revokedAt?: number | null
  memberUuid?: string | null
  origin: 'manual' | 'system' | 'event' | string
}

export interface BadgeAssignment extends BadgeAssignmentModel {
  badge: Badge
  team?: Team
  issuedBy: User
  member?: TeamMember
}
