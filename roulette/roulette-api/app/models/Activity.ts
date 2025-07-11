import { User } from "./User"
import { Badge } from "./Badge"
import { Team, TeamMember } from "./Team"

export interface ActivityModel {
  uuid: string
  name: string
  description: string

  category: string
  categoryLabel: string

  impact: 'positive' | 'negative' | 'neutral'

  score: number
  authorUuid: string

  badgeUuid?: string | null
  autoConvertToBadge?: boolean | null
  conversionThreshold?: number | null
  conversionWindow?: 'team' | 'member' | null
  validityDuration?: number | null

  createdAt: number
  updatedAt: number
}

export interface Activity extends ActivityModel {
  author?: User
  badge?: Badge
}

export interface ActivityAssignmentModel {
  uuid: string
  activityUuid: string
  badgeUuid?: string | null

  teamUuid?: string | null
  memberUuid?: string | null

  authorUuid: string
  origin: 'system' | 'manual'
  issuedAt: number
  status: 'pending' | 'approved' | 'cancelled' | 'contested' | 'archived'

  locationIp?: string
  locationCountry?: string | null
  locationCity?: string | null
  locationLatitude?: number | null
  locationLongitude?: number | null
  locationRegion?: string | null
  locationTimezone?: string | null
  locationPostalCode?: string | null

  userAgent?: string | null
  device?: string | null
  platform?: string | null
  ipAddress?: string | null

  comment?: string | null
  createdAt: number
  updatedAt: number
  validatedAt?: number | null
  validatedByUuid?: string | null
}

export interface ActivityAssignment extends ActivityAssignmentModel {
  team?: Team
  badge?: Badge
  activity: Activity
  member?: TeamMember
  issuedByUser?: User
}