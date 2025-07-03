import { desc, eq } from 'drizzle-orm'
import { UserModel } from '../../models/User'
import { sessions } from '../../database/schema'
import { SessionModel } from '../../models/Session'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { ISessionRepository } from '../contracts/ISessionRepository'

/**
 * Session Session Repository Options
 */
export interface SessionRepositoryOptions {
  database: LibSQLDatabase
}

/**
 * Session Session Repository
 */
export class SessionRepository implements ISessionRepository {
  private readonly database: LibSQLDatabase

  /**
   * Create a new instance of SessionRepository
   */
  constructor ({ database }: SessionRepositoryOptions) {
    this.database = database
  }

  /**
   * List sessions
   *
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  async list (limit: number): Promise<SessionModel[]> {
    return await this
      .database
      .select()
      .from(sessions)
      .orderBy(desc(sessions.createdAt))
      .limit(limit)
  }

  /**
   * List sessions
   *
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  async listByUser (user: UserModel, limit: number): Promise<SessionModel[]> {
    return await this
      .database
      .select()
      .from(sessions)
      .where(eq(sessions.userUuid, user.uuid))
      .orderBy(desc(sessions.createdAt))
      .limit(limit)
  }

  /**
   * Find a session by UUID
   *
   * @param uuid - The session UUID
   * @returns The session or undefined
   */
  async findByUuid (uuid: string): Promise<SessionModel | undefined> {
    const result = await this.database.select().from(sessions).where(eq(sessions.uuid, uuid)).get()
    return result ?? undefined
  }

  /**
   * Retrieves the latest session for a given user.
   *
   * @param user - The user whose last session is being retrieved.
   * @returns The latest session or `undefined` if none exists.
   */
  async getLatest (user: UserModel): Promise<SessionModel | undefined> {
    return await this.database
      .select()
      .from(sessions)
      .where(eq(sessions.userUuid, user.uuid))
      .orderBy(desc(sessions.createdAt))
      .limit(1)
      .get()
  }

  /**
   * Create a session
   *
   * @param session - The session to create
   * @returns The ID of the created session
   */
  async create (session: SessionModel): Promise<SessionModel> {
    return await this.database.insert(sessions).values(session).returning().get()
  }

  /**
   * Update a session
   *
   * @param uuid - The session uuid
   * @param session - The partial session data
   * @returns The updated session or undefined
   */
  async update (uuid: string, session: Partial<SessionModel>): Promise<SessionModel | undefined> {
    const result = await this.database.update(sessions).set(session).where(eq(sessions.uuid, uuid)).returning().get()
    return result ?? undefined
  }

  /**
   * Delete a session
   *
   * @param uuid - The session uuid
   * @returns `true` if deleted, `false` otherwise
   */
  async delete (uuid: string): Promise<boolean> {
    const result = await this.database.delete(sessions).where(eq(sessions.uuid, uuid)).run()
    return result.rowsAffected > 0
  }
}
