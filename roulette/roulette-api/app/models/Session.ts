/**
 * Session Model Interface
*/
export interface SessionModel {
  ip: string
  uuid: string
  userUuid: string
  createdAt: number
  expiresAt: number
  closedAt?: number | null
  userAgent?: string | null
  lastActivityAt: number
}

/**
 * Session Interface
*/
export interface Session extends SessionModel {}
