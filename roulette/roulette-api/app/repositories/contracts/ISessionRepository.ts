import { UserModel } from '../../models/User'
import { SessionModel } from '../../models/Session'

/**
 * Session Repository contract
 */
export interface ISessionRepository {
  /**
   * List sessions
   *
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  list: (limit: number) => Promise<SessionModel[]>

  /**
   * List sessions by user
   *
   * @param user - The user
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  listByUser: (user: UserModel, limit: number) => Promise<SessionModel[]>

  /**
   * Find a session by UUID
   *
   * @param uuid - The session UUID
   * @returns The session or undefined
   */
  findByUuid: (uuid: string) => Promise<SessionModel | undefined>

  /**
   * Get latest session for a user
   *
   * @param user - The user
   * @returns The latest session or undefined
   */
  getLatest: (user: UserModel) => Promise<SessionModel | undefined>

  /**
   * Create a session
   *
   * @param session - The session data
   * @returns The created session
   */
  create: (session: SessionModel) => Promise<SessionModel>

  /**
   * Update a session
   *
   * @param session - The session to update
   * @param data - The data to update in the session
   * @returns The updated session or undefined
   */
  update: (session: SessionModel, data: Partial<SessionModel>) => Promise<SessionModel | undefined>

  /**
   * Delete a session
   *
   * @param session - The session to delete
   * @returns `true` if deleted, `false` otherwise
   */
  delete: (session: SessionModel) => Promise<boolean>
}
