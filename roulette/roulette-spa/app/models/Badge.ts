import { User } from "./User"
import { Team, TeamMember } from "./Team"

export type BadgeType = 'victory' | 'participation' | 'achievement' | 'creativity' | 'teamwork' | 'special'

export interface Badge {
  uuid: string
  name: string
  color: string
  score: number
  author?: User
  iconUrl?: string
  category: string
  createdAt: number
  updatedAt: number
  authorUuid: string
  description: string
  categoryLabel: string
  activityUuid?: string
  maxAssignments: number
  expirationDays?: number
  visibility: 'public' | 'private'
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
  issuedByUuid: string
  comment?: string
  revokedBy?: User
  badgeUuid: string
  teamUuid?: string
  revokedAt?: number
  memberUuid?: string
  origin: 'manual' | 'system' | 'event'
  badge: Badge
  team?: Team
  issuedBy: User
  member?: TeamMember
}