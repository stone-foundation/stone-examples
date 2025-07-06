import { and, eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { UserModel } from '../../models/User'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IUserRepository } from '../contracts/IUserRepository'

/**
 * User Repository Options
 */
export interface UserRepositoryOptions {
  database: LibSQLDatabase
}

/**
 * User Repository
 */
export class UserRepository implements IUserRepository {
  private readonly database: LibSQLDatabase

  /**
   * Create a new instance of UserRepository
   */
  constructor ({ database }: UserRepositoryOptions) {
    this.database = database
  }

  /**
   * List users
   *
   * @param limit - The limit of users to list
   * @returns The list of users
   */
  async list (limit: number): Promise<UserModel[]> {
    return await this.database.select().from(users).limit(limit)
  }

  /**
   * List users by dynamic conditions
   *
   * @param conditions - Conditions to filter users
   * @param limit - The limit of users to list
   * @returns The list of users
   */
  async listBy (conditions: Partial<UserModel>, limit: number): Promise<UserModel[]> {
    const whereClauses = []

    if (conditions.teamUuid !== undefined && conditions.teamUuid !== null) {
      whereClauses.push(eq(users.teamUuid, conditions.teamUuid))
    }

    if (conditions.isActive !== undefined) {
      whereClauses.push(eq(users.isActive, conditions.isActive))
    }

    if (conditions.isOnline !== undefined) {
      whereClauses.push(eq(users.isOnline, conditions.isOnline))
    }

    const query = this.database.select().from(users)

    if (whereClauses.length > 0) {
      await query.where(and(...whereClauses))
    }

    return await query.limit(limit)
  }

  /**
   * Find a user by uuid
   *
   * @param uuid - The uuid of the user to find
   * @returns The user or undefined if not found
   */
  async findByUuid (uuid: string): Promise<UserModel | undefined> {
    const result = await this.database.select().from(users).where(eq(users.uuid, uuid)).get()
    return result ?? undefined
  }

  /**
   * Find a user by dynamic conditions
   *
   * @param conditions - Conditions to match the user
   * @returns The user or undefined if not found
   */
  async findBy (conditions: Partial<UserModel>): Promise<UserModel | undefined> {
    const whereClauses = []

    if (conditions.phone !== undefined) {
      whereClauses.push(eq(users.phone, conditions.phone))
    }

    if (conditions.username !== undefined) {
      whereClauses.push(eq(users.username, conditions.username))
    }

    if (conditions.uuid !== undefined) {
      whereClauses.push(eq(users.uuid, conditions.uuid))
    }

    if (whereClauses.length === 0) return undefined

    const result = await this.database
      .select()
      .from(users)
      .where(and(...whereClauses))
      .get()

    return result ?? undefined
  }

  /**
   * Create a user
   *
   * @param user - The user to create
   * @returns The uuid of the created user
   */
  async create (user: UserModel): Promise<string | undefined> {
    await this.database.insert(users).values(user)
    return user.uuid
  }

  /**
   * Update a user
   *
   * @param user - The user to update
   * @param data - The data to update in the user
   * @returns The updated user or undefined if not found
   */
  async update ({ uuid }: UserModel, data: Partial<UserModel>): Promise<UserModel | undefined> {
    const result = await this.database.update(users).set(data).where(eq(users.uuid, uuid)).returning().get()
    return result ?? undefined
  }

  /**
   * Delete a user
   *
   * @param user - The user to delete
   * @returns `true` if the user was deleted, `false` if not
   */
  async delete ({ uuid }: UserModel): Promise<boolean> {
    const result = await this.database.delete(users).where(eq(users.uuid, uuid)).run()
    return result.rowsAffected > 0
  }
}
