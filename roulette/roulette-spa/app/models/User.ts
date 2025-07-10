import { Team } from './Team'

/**
 * User Interface
*/
export interface User {
  team?: Team
  uuid: string
  phone: string
  roles?: string | null
  fullname: string
  username: string
  lastSeen?: number | null
  isActive: boolean
  isOnline: boolean
  createdAt: number
  teamUuid?: string | null
  updatedAt: number
  isModerator?: boolean
  isAdmin?: boolean
  isPunched?: boolean
  isCaptain?: boolean
  avatarUrl?: string
  avatarColor?: string | null
}

/**
 * User Login Interface
*/
export interface UserLogin {
  otp?: string
  phone: string
  password?: string
}

/**
 * User Token Interface
*/
export interface UserToken {
  scope: string
  stage: string
  createdAt: number
  expiresIn: number
  tokenType: string
  accessToken: string
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
 * User Activation Interface
*/
export interface UserActivation {
  isActive: boolean
}
