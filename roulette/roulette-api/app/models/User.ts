import { Team } from './Team'
import jwt from 'jsonwebtoken'
import { Session } from './Session'

/**
 * User Model Interface
*/
export interface UserModel {
  uuid: string
  otp?: string | null
  phone: string
  roles?: string[] | null // Array of roles, e.g., ['admin', 'moderator']
  fullname: string
  username: string
  otpCount?: number | null
  lastSeen?: number | null
  isActive: boolean
  isOnline: boolean
  createdAt: number
  teamUuid?: string | null
  password?: string | null
  updatedAt: number
  avatarUrl?: string | null
  otpExpiresAt?: number | null
  presenceActivityUuid?: string | null
}

/**
 * User Interface
*/
export interface User extends UserModel {
  team?: Team
  isModerator?: boolean
  isAdmin?: boolean
  isPunched?: boolean
  isCaptain?: boolean
  isPresent?: boolean
  isLate?: boolean
  otp: undefined
  session?: Session
  otpCount: undefined
  password: undefined
  otpExpiresAt: undefined
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
  isActive: boolean
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
