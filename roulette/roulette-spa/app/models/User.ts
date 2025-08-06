/**
 * User Interface
*/
export interface User {
  uuid: string
  phone: string
  roles?: string[]
  fullname: string
  username: string
  lastSeen?: number
  isActive: boolean
  isOnline: boolean
  createdAt: number
  updatedAt: number
  isAdmin?: boolean
  avatarUrl?: string
  isModerator?: boolean
  avatarColor?: string
}

export interface UserRegistration {
  phone: string
  mission: string
  fullname: string
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
  otp: string
  newPassword: string
}

/**
 * User Activation Interface
*/
export interface UserActivation {
  status: 'active' | 'inactive' | 'not_found'
}
