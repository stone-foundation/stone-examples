import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { PostComment, PostCommentModel } from '../models/Post'
import { isNotEmpty, Service, IContainer } from '@stone-js/core'
import { IPostCommentRepository } from '../repositories/contracts/IPostCommentRepository'

/**
 * PostComment Service Options
 */
export interface PostCommentServiceOptions {
  postCommentRepository: IPostCommentRepository
}

/**
 * PostComment Service
 */
@Service({ alias: 'postCommentService' })
export class PostCommentService {
  private readonly postCommentRepository: IPostCommentRepository

  constructor ({ postCommentRepository }: PostCommentServiceOptions) {
    this.postCommentRepository = postCommentRepository
  }

  /**
   * Resolve route binding
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<PostComment | undefined> {
    const commentService = container.resolve<PostCommentService>('postCommentService')
    return await commentService.findBy({ [key]: value })
  }

  /**
   * List all comments
   */
  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<PostComment>> {
    const result = await this.postCommentRepository.list(limit, page)
    result.items = result.items.map(v => this.toPostComment(v))
    return result
  }

  /**
   * List comments by conditions
   */
  async listBy (conditions: Partial<PostCommentModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<PostComment>> {
    const result = await this.postCommentRepository.listBy(conditions, limit, page)
    result.items = result.items.map(v => this.toPostComment(v))
    return result
  }

  /**
   * Find comment by uuid
   */
  async findByUuid (uuid: string): Promise<PostComment | undefined> {
    const model = await this.postCommentRepository.findByUuid(uuid)
    if (isNotEmpty<PostCommentModel>(model)) return this.toPostComment(model)
  }

  /**
   * Find comment by conditions
   */
  async findBy (conditions: Partial<PostCommentModel>): Promise<PostComment> {
    const model = await this.postCommentRepository.findBy(conditions)
    if (isNotEmpty<PostCommentModel>(model)) return this.toPostComment(model)
    throw new NotFoundError(`Comment not found with conditions: ${JSON.stringify(conditions)}`)
  }

  /**
   * Create comment
   */
  async create (comment: PostComment, author: User): Promise<string | undefined> {
    const now = Date.now()
    return await this.postCommentRepository.create({
      ...comment,
      authorUuid: author.uuid,
      uuid: randomUUID(),
      createdAt: now,
      updatedAt: now,
      likeCount: 0
    })
  }

  /**
   * Toggle like on post
   */
  async toggleLike (comment: PostComment, user: User): Promise<void> {
    let likeCount = comment.likeCount
    let likedByUuids = (comment.likedByUuids ?? []) as string[]

    if (likedByUuids.includes(user.uuid)) {
      likeCount--
      likedByUuids = likedByUuids.filter(uuid => uuid !== user.uuid)
    } else {
      likeCount++
      likedByUuids.push(user.uuid)
    }

    await this.update(comment, {
      likeCount,
      likedByUuids
    })
  }

  /**
   * Update comment
   */
  async update (comment: PostComment, data: Partial<PostComment>): Promise<PostComment> {
    data.updatedAt = Date.now()
    const model = await this.postCommentRepository.update(comment, data)
    if (isNotEmpty<PostCommentModel>(model)) return this.toPostComment(model)
    throw new NotFoundError(`Comment with ID ${comment.uuid} not found`)
  }

  /**
   * Delete comment
   */
  async delete (comment: PostComment): Promise<boolean> {
    return await this.postCommentRepository.delete(comment)
  }

  /**
   * Convert PostCommentModel to PostComment (safe)
   */
  toPostComment (model: PostCommentModel, author?: User): PostComment {
    return {
      ...model,
      author
    }
  }
}
