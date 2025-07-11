import { and, eq } from 'drizzle-orm'
import { posts } from '../../database/schema'
import { PostModel } from '../../models/Post'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { isEmpty, IBlueprint } from '@stone-js/core'
import { ListMetadataOptions } from '../../models/App'
import { IPostRepository } from '../contracts/IPostRepository'
import { IMetadataRepository } from '../contracts/IMetadataRepository'

export interface RepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
}

export class PostRepository implements IPostRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, database, metadataRepository }: RepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.tableName = blueprint.get('drizzle.tables.posts.name', 'posts')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<PostModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = (page - 1) * limit

    const items = await this.database.select().from(posts).limit(limit).offset(offset)
    const total = await this.count()
    const nextPage = items.length === limit ? page + 1 : undefined

    return { page, limit, total, items, nextPage }
  }

  async listBy (conditions: Partial<PostModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<PostModel>> {
    const whereClauses = []

    if (conditions.teamUuid) whereClauses.push(eq(posts.teamUuid, conditions.teamUuid))
    if (conditions.authorUuid) whereClauses.push(eq(posts.authorUuid, conditions.authorUuid))
    if (conditions.type) whereClauses.push(eq(posts.type, conditions.type))
    if (conditions.visibility) whereClauses.push(eq(posts.visibility, conditions.visibility))

    limit ??= 10
    page = isEmpty(page) ? 1 : Number(page)
    const offset = (page - 1) * limit

    const query = this.database.select().from(posts).limit(limit).offset(offset)
    if (whereClauses.length > 0) query.where(and(...whereClauses))

    const items = await query
    const total = await this.count()
    const nextPage = items.length === limit ? page + 1 : undefined

    return { page, limit, total, items, nextPage }
  }

  async findByUuid (uuid: string): Promise<PostModel | undefined> {
    return await this.database.select().from(posts).where(eq(posts.uuid, uuid)).get()
  }

  async findBy (conditions: Partial<PostModel>): Promise<PostModel | undefined> {
    const whereClauses = []
    if (conditions.uuid) whereClauses.push(eq(posts.uuid, conditions.uuid))
    if (conditions.authorUuid) whereClauses.push(eq(posts.authorUuid, conditions.authorUuid))
    if (conditions.type) whereClauses.push(eq(posts.type, conditions.type))
    if (whereClauses.length === 0) return undefined

    return await this.database.select().from(posts).where(and(...whereClauses)).get()
  }

  async create (post: PostModel): Promise<string | undefined> {
    await this.database.insert(posts).values(post)
    await this.metadataRepository.increment(this.tableName, { lastUuid: post.uuid })
    return post.uuid
  }

  async update ({ uuid }: PostModel, data: Partial<PostModel>): Promise<PostModel | undefined> {
    return await this.database.update(posts).set(data).where(eq(posts.uuid, uuid)).returning().get()
  }

  async delete ({ uuid }: PostModel): Promise<boolean> {
    const result = await this.database.delete(posts).where(eq(posts.uuid, uuid)).run()
    if (result.rowsAffected > 0) {
      await this.metadataRepository.decrement(this.tableName)
      return true
    }
    return false
  }

  async count (): Promise<number> {
    const meta = await this.metadataRepository.get(this.tableName)
    return meta?.total ?? 0
  }
}
