import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { MediaService } from './MediaService'
import { Post, PostModel } from '../models/Post'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { isNotEmpty, Service, IContainer } from '@stone-js/core'
import { IPostRepository } from '../repositories/contracts/IPostRepository'

/**
 * Post Service Options
 */
export interface PostServiceOptions {
  mediaService: MediaService
  postRepository: IPostRepository
}

/**
 * Post Service
 */
@Service({ alias: 'postService' })
export class PostService {
  private readonly mediaService: MediaService
  private readonly postRepository: IPostRepository

  constructor ({ mediaService, postRepository }: PostServiceOptions) {
    this.mediaService = mediaService
    this.postRepository = postRepository
  }

  /**
   * Resolve route binding
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<Post | undefined> {
    const postService = container.resolve<PostService>('postService')
    return await postService.findBy({ [key]: value })
  }

  /**
   * List all posts
   */
  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Post>> {
    const result = await this.postRepository.list(limit, page)
    result.items = result.items.map(v => this.toPost(v))
    return result
  }

  /**
   * List posts by conditions
   */
  async listBy (conditions: Partial<PostModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Post>> {
    const result = await this.postRepository.listBy(conditions, limit, page)
    result.items = result.items.map(v => this.toPost(v))
    return result
  }

  /**
   * Find post by uuid
   */
  async findByUuid (uuid: string): Promise<Post | undefined> {
    const model = await this.postRepository.findByUuid(uuid)
    if (isNotEmpty<PostModel>(model)) return this.toPost(model)
  }

  /**
   * Find post by conditions
   */
  async findBy (conditions: Partial<PostModel>): Promise<Post> {
    const model = await this.postRepository.findBy(conditions)
    if (isNotEmpty<PostModel>(model)) return this.toPost(model)
    throw new NotFoundError(`Post not found with conditions: ${JSON.stringify(conditions)}`)
  }

  /**
   * Create post
   */
  async create (post: Post, author: User): Promise<string | undefined> {
    const now = Date.now()
    const uuid = randomUUID()

    return await this.postRepository.create({
      ...post,
      uuid,
      likeCount: 0,
      createdAt: now,
      updatedAt: now,
      commentCount: 0,
      authorUuid: author.uuid
    }, author)
  }

  /**
   * Toggle like on post
   */
  async toggleLike (post: Post, user: User): Promise<void> {
    let likeCount = post.likeCount
    let likedByUuids = (post.likedByUuids ?? []) as string[]

    if (likedByUuids.includes(user.uuid)) {
      likeCount--
      likedByUuids = likedByUuids.filter(uuid => uuid !== user.uuid)
    } else {
      likeCount++
      likedByUuids.push(user.uuid)
    }

    await this.update(post, {
      likeCount,
      likedByUuids
    }, user)
  }

  /**
   * Update post
   */
  async update (post: Post, data: Partial<Post>, author: User): Promise<Post> {
    data.updatedAt = Date.now()
    const model = await this.postRepository.update(post, data, author)
    if (isNotEmpty<PostModel>(model)) return this.toPost(model)
    throw new NotFoundError(`Post with ID ${post.uuid} not found`)
  }

  /**
   * Delete post
   */
  async delete (post: Post, author: User): Promise<boolean> {
    await this.mediaService.deleteS3Object(post.imageUrl)
    return await this.postRepository.delete(post, author)
  }

  /**
   * Count total posts
   */
  async count (): Promise<number> {
    return await this.postRepository.count()
  }

  /**
   * Increment comment count for a post
   */
  async incrementCommentCount (postUuid: string, increment: number, author: User): Promise<void> {
    const post = await this.postRepository.findByUuid(postUuid)
    if (!post) {
      throw new NotFoundError(`Post with UUID ${postUuid} not found`)
    }
    post.commentCount += increment ?? 1
    await this.postRepository.update(post, { commentCount: post.commentCount }, author)
  }

  /**
   * Convert PostModel to Post (safe)
   */
  toPost (model: PostModel, author?: User): Post {
    return {
      ...model,
      author
    }
  }
}
