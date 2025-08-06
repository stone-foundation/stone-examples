import { User } from './User'
import { Badge } from './Badge'
import { Team, TeamMember } from './Team'

export interface ActivityModel {
  uuid: string
  name: string
  description: string

  category: string
  categoryLabel: string

  impact: 'positive' | 'negative' | 'neutral'

  score: number
  missionUuid: string

  badgeUuid?: string | null
  autoConvertToBadge?: boolean | null
  conversionThreshold?: number | null
  conversionWindow?: 'team' | 'member' | null
  validityDuration?: number | null

  createdAt: number
  updatedAt: number
}

export interface Activity extends ActivityModel {
  badge?: Badge
}

export interface ActivityAssignmentModel {
  uuid: string
  missionUuid: string
  activityUuid: string
  badgeUuid?: string | null
  activityCategory?: string

  teamUuid?: string | null
  teamMemberUuid?: string | null

  issuedByUuid: string
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
  issuedBy?: User
  activity: Activity
  validatedBy?: User
  teamMember?: TeamMember
}
