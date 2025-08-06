import jwt from 'jsonwebtoken'
import { Mission } from './Mission'
import { Session } from './Session'
import { Team, TeamMember } from './Team'
import { Post, PostComment } from './Post'
import { Badge, BadgeAssignment } from './Badge'
import { Activity, ActivityAssignment } from './Activity'

/**
 * User Model Interface
*/
export interface UserModel {
  uuid: string
  otp?: string | null
  phone: string
  roles?: unknown
  fullname: string
  username: string
  otpCount?: number | null
  lastSeen?: number | null
  isActive: boolean
  isOnline: boolean
  createdAt: number
  password?: string | null
  updatedAt: number
  avatarUrl?: string | null
  otpExpiresAt?: number | null
}

/**
 * User Interface
*/
export interface User extends UserModel {
  session?: Session
  isAdmin?: boolean
  isModerator?: boolean
}

/**
 * User Activation Request Interface
*/
export interface UserActivationRequest {
  phone: string
}

/**
 * User Activation Interface
*/
export interface UserActivation {
  otp: string
  uuid: string
  phone: string
  username: string
  status: 'active' | 'inactive' | 'not_found'
}

/**
 * User Login Interface
*/
export interface UserCredentials {
  otp?: string
  phone: string
  password?: string
}

/**
 * User Register Interface
*/
export interface UserRegister {
  phone: string
  fullname: string
  username: string
  password: string
}

/**
 * User Change Password Interface
*/
export interface UserChangePassword {
  otp?: string
  password?: string
  newPassword: string
}

/**
 * User Token Interface
*/
export interface UserToken {
  expiresIn: number
  tokenType: string
  accessToken: string
}

/**
 * User Token Payload Interface
*/
export interface UserTokenPayload extends jwt.JwtPayload {
  user: User
  session: Session
}

export type UserHistoryType = 'user' | 'team' | 'post' | 'badge' | 'mission' | 'activity' | 'team_member' | 'post_comment' | 'badge_assignment' | 'activity_assignment'
export interface UserHistoryModel {
  id: number
  uuid: string
  itemUuid: string
  createdAt: number
  authorUuid: string
  action: 'created' | 'updated' | 'deleted'
  type: UserHistoryType
}

export interface UserHistory extends UserHistoryModel {
  author: User
  team?: Team
  post?: Post
  badge?: Badge
  mission?: Mission
  activity?: Activity
  postComment?: PostComment
  teamMember?: TeamMember
  badgeAssignment?: BadgeAssignment
  activityAssignment?: ActivityAssignment
}