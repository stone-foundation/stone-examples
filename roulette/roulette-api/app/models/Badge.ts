import { Team, TeamMember } from "./Team"
import { User } from "./User"

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
}

export interface BadgeAssignmentModel {
  uuid: string
  issuedBy: User
  issuedAt: number
  comment?: string | null
  revokedBy?: User | null
  badgeUuid: string
  teamUuid?: string | null
  revoked?: boolean | null
  revokedAt?: number | null
  memberUuid?: string | null
  origin: 'manual' | 'system' | 'event'
}

export interface BadgeAssignment extends BadgeAssignmentModel {
  badge: Badge
  team?: Team
  member?: TeamMember
}