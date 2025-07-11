import { and, eq } from 'drizzle-orm'
import { postComments } from '../../database/schema'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { PostCommentModel } from '../../models/Post'
import { ListMetadataOptions } from '../../models/App'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IPostCommentRepository } from '../contracts/IPostCommentRepository'

export interface RepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
}

export class PostCommentRepository implements IPostCommentRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, database, metadataRepository }: RepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.tableName = blueprint.get('drizzle.tables.postComments.name', 'post_comments')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<PostCommentModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = (page - 1) * limit

    const items = await this.database.select().from(postComments).limit(limit).offset(offset)
    const total = await this.count()
    const nextPage = items.length === limit ? page + 1 : undefined

    return { page, limit, total, items, nextPage }
  }

  async listBy (conditions: Partial<PostCommentModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<PostCommentModel>> {
    const whereClauses = []

    if (conditions.postUuid) whereClauses.push(eq(postComments.postUuid, conditions.postUuid))
    if (conditions.authorUuid) whereClauses.push(eq(postComments.authorUuid, conditions.authorUuid))

    limit ??= 10
    page = isEmpty(page) ? 1 : Number(page)
    const offset = (page - 1) * limit

    const query = this.database.select().from(postComments).limit(limit).offset(offset)
    if (whereClauses.length > 0) query.where(and(...whereClauses))

    const items = await query
    const total = await this.count()
    const nextPage = items.length === limit ? page + 1 : undefined

    return { page, limit, total, items, nextPage }
  }

  async findByUuid (uuid: string): Promise<PostCommentModel | undefined> {
    return await this.database.select().from(postComments).where(eq(postComments.uuid, uuid)).get()
  }

  async findBy (conditions: Partial<PostCommentModel>): Promise<PostCommentModel | undefined> {
    const whereClauses = []
    if (conditions.uuid) whereClauses.push(eq(postComments.uuid, conditions.uuid))
    if (conditions.content) whereClauses.push(eq(postComments.content, conditions.content))
    if (whereClauses.length === 0) return undefined

    return await this.database.select().from(postComments).where(and(...whereClauses)).get()
  }

  async create (comment: PostCommentModel): Promise<string | undefined> {
    await this.database.insert(postComments).values(comment)
    await this.metadataRepository.increment(this.tableName, { lastUuid: comment.uuid })
    return comment.uuid
  }

  async update ({ uuid }: PostCommentModel, data: Partial<PostCommentModel>): Promise<PostCommentModel | undefined> {
    return await this.database.update(postComments).set(data).where(eq(postComments.uuid, uuid)).returning().get()
  }

  async delete ({ uuid }: PostCommentModel): Promise<boolean> {
    const result = await this.database.delete(postComments).where(eq(postComments.uuid, uuid)).run()
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
