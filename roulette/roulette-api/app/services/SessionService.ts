import { User } from '../models/User'
import { Service } from '@stone-js/core'
import { randomUUID } from 'node:crypto'
import { Session } from '../models/Session'
import { ISessionRepository } from '../repositories/contracts/ISessionRepository'

/**
 * Session Service Options
 */
export interface SessionServiceOptions {
  sessionRepository: ISessionRepository
}

/**
 * Session Service
*/
@Service({ alias: 'sessionService' })
export class SessionService {
  private readonly sessionRepository: ISessionRepository

  /**
   * Create a new Session Service
   *
   * @param options - The options to create the service
  */
  constructor ({ sessionRepository }: SessionServiceOptions) {
    this.sessionRepository = sessionRepository
  }

  /**
   * Finds all sessions.
   *
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  async list (limit: number): Promise<Session[]> {
    return await this.sessionRepository.list(limit)
  }

  /**
   * Finds a sessions by user.
   *
   * @param user - The user to look up
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  async getByUser (user: User, limit: number): Promise<Session[]> {
    return await this.sessionRepository.listByUser(user, limit)
  }

  /**
   * Finds a session by uuid.
   *
   * @param uuid - The session uuid to look up
   * @returns The session data or `undefined` if not found
   */
  async getByUuid (uuid: string): Promise<Session | undefined> {
    return await this.sessionRepository.findByUuid(uuid)
  }

  /**
   * Finds the latest session of a user.
   *
   * @param user - The user to look up
   * @returns The latest session or `undefined` if not found
   */
  async getLatest (user: User): Promise<Session | undefined> {
    return await this.sessionRepository.getLatest(user)
  }

  /**
   * Creates a new session for a user.
   *
   * @param user - The user to create the session for
   * @param ip - The IP address of the user
   * @param userAgent - The user agent of the user
   * @returns The created session
  */
  async createForUser (user: User, ip: string, userAgent?: string): Promise<Session> {
    const session = {
      ip,
      userAgent,
      uuid: randomUUID(),
      userUuid: user.uuid,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      expiresAt: Date.now() + 3600
    }

    return await this.sessionRepository.create(session)
  }

  /**
   * Updates the last activity timestamp of a session.
   *
   * @param sessionId - The session ID to update
   * @returns `true` if the session was updated, otherwise `false`
   */
  async updateLastActivity (session: Session): Promise<void> {
    await this.sessionRepository.update(session.uuid, { lastActivityAt: Date.now() })
  }

  /**
   * Extends a session expiration time.
   *
   * @param sessionId - The session ID to extend
   * @param additionalTime - Additional time in milliseconds
   * @returns `true` if the session was extended, otherwise `false`
   */
  async extend (session: Session, additionalTime: number): Promise<Session> {
    session.expiresAt = Date.now() + additionalTime
    await this.sessionRepository.update(session.uuid, session)
    return session
  }

  /**
   * Closes a session.
   *
   * @param sessionId - The session ID to close
   */
  async close (session: Session): Promise<void> {
    session.closedAt = Date.now()
    await this.sessionRepository.update(session.uuid, session)
  }
}
