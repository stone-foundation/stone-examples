import { and, eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { User, UserModel } from '../../models/User'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { ListMetadataOptions } from '../../models/App'
import { IUserRepository } from '../contracts/IUserRepository'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'

/**
 * User Repository Options
 */
export interface UserRepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
  userHistoryRepository: IUserHistoryRepository
}

/**
 * User Repository (Drizzle)
 */
export class UserRepository implements IUserRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository
  private readonly userHistoryRepository: IUserHistoryRepository

  /**
   * Create a new instance of UserRepository
   */
  constructor ({ database, metadataRepository, userHistoryRepository, blueprint }: UserRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.userHistoryRepository = userHistoryRepository
    this.tableName = blueprint.get('drizzle.tables.users.name', 'users')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<UserModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = ((page ?? 1) - 1) * limit

    const items = await this.database
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)

    const total = await this.count()
    const nextPage = items.length === limit ? (page ?? 1) + 1 : undefined

    return {
      page,
      limit,
      total,
      items,
      nextPage
    }
  }

  async listBy (conditions: Partial<UserModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<UserModel>> {
    limit ??= 10
    const whereClauses = []

    if (conditions.isActive !== undefined) whereClauses.push(eq(users.isActive, conditions.isActive))
    if (conditions.isOnline !== undefined) whereClauses.push(eq(users.isOnline, conditions.isOnline))

    const offset = (Number(page) - 1) * limit

    const query = this.database
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)

    if (whereClauses.length > 0) {
      query.where(and(...whereClauses))
    }

    const items = await query
    const total = await this.count()
    const nextPage = items.length === limit ? Number(page) + 1 : undefined

    return {
      page,
      limit,
      total,
      items,
      nextPage
    }
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

    if (conditions.uuid !== undefined) whereClauses.push(eq(users.uuid, conditions.uuid))
    if (conditions.phone !== undefined) whereClauses.push(eq(users.phone, conditions.phone))
    if (conditions.username !== undefined) whereClauses.push(eq(users.username, conditions.username))

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
   * @param author - The user who is creating this user
   * @returns The uuid of the created user
   */
  async create (user: UserModel, author: User): Promise<string | undefined> {
    await this.database.insert(users).values(user)
    await this.metadataRepository.increment(this.tableName, { lastUuid: user.uuid })
    await this.userHistoryRepository.makeHistoryEntry({
      type: 'user',
      action: 'created',
      itemUuid: user.uuid,
    }, author)
    return user.uuid
  }

  /**
   * Update a user
   *
   * @param user - The user to update
   * @param data - The data to update in the user
   * @param author - The user who is updating this user
   * @returns The updated user or undefined if not found
   */
  async update ({ uuid }: UserModel, data: Partial<UserModel>, author: User): Promise<UserModel | undefined> {
    const result = await this.database
      .update(users)
      .set(data)
      .where(eq(users.uuid, uuid))
      .returning()
      .get()

    await this.userHistoryRepository.makeHistoryEntry({
      type: 'user',
      itemUuid: uuid,
      action: 'updated',
    }, author)

    return result ?? undefined
  }

  /**
   * Delete a user
   *
   * @param user - The user to delete
   * @param author - The user who is deleting this user
   * @returns `true` if the user was deleted, `false` if not
   */
  async delete ({ uuid }: UserModel, author: User): Promise<boolean> {
    const result = await this.database
      .delete(users)
      .where(eq(users.uuid, uuid))
      .run()

    if (result.rowsAffected > 0) {
      await this.metadataRepository.decrement(this.tableName)
      await this.userHistoryRepository.makeHistoryEntry({
        type: 'user',
        itemUuid: uuid,
        action: 'deleted',
      }, author)
      return true
    }

    return false
  }

  async count (): Promise<number> {
    const meta = await this.metadataRepository.get(this.tableName)
    return meta?.total ?? 0
  }
}