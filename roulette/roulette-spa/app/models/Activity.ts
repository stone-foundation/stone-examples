import { User } from './User'
import { Badge } from './Badge'
import { Team, TeamMember } from './Team'

export interface Activity {
  uuid: string
  name: string
  description: string

  category: string
  categoryLabel: string

  impact: 'positive' | 'negative' | 'neutral'

  score: number
  missionUuid: string

  badgeUuid?: string
  autoConvertToBadge?: boolean
  conversionThreshold?: number
  conversionWindow?: 'team' | 'member'
  validityDuration?: number

  createdAt: number
  updatedAt: number
  
  badge?: Badge
}

export interface ActivityAssignment {
  uuid: string
  missionUuid: string
  badgeUuid?: string
  activityUuid: string
  activityCategory?: string

  teamUuid?: string
  teamMemberUuid?: string

  issuedByUuid: string
  origin: 'system' | 'manual'
  issuedAt: number
  status: 'pending' | 'approved' | 'cancelled' | 'contested' | 'archived'

  locationIp?: string
  locationCountry?: string
  locationCity?: string
  locationLatitude?: number
  locationLongitude?: number
  locationRegion?: string
  locationTimezone?: string
  locationPostalCode?: string

  userAgent?: string
  device?: string
  platform?: string
  ipAddress?: string

  comment?: string
  createdAt: number
  updatedAt: number
  validatedAt?: number
  validatedByUuid?: string
  
  team?: Team
  badge?: Badge
  issuedBy?: User
  activity: Activity
  validatedBy?: User
  teamMember?: TeamMember
}

export interface TeamsStats {
  teams: Team[]
  totalPosts: number
  totalScores: number
  totalBadges: number
  totalPresence: number
  totalMembers: number
  lastestBadges: Badge[]
  totalActivities: number
  totalBadgeScores: number
  totalActivityScores: number
  latestactivities: Activity[]
}