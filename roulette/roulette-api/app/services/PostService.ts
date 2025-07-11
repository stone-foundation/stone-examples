import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { Post, PostModel } from '../models/Post'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { isNotEmpty, Service, IContainer } from '@stone-js/core'
import { IPostRepository } from '../repositories/contracts/IPostRepository'

/**
 * Post Service Options
 */
export interface PostServiceOptions {
  postRepository: IPostRepository
}

/**
 * Post Service
 */
@Service({ alias: 'postService' })
export class PostService {
  private readonly postRepository: IPostRepository

  constructor ({ postRepository }: PostServiceOptions) {
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
    return await this.postRepository.create({
      ...post,
      authorUuid: author.uuid,
      uuid: randomUUID(),
      createdAt: now,
      updatedAt: now,
      likeCount: 0,
      commentCount: 0
    })
  }

  /**
   * Update post
   */
  async update (post: Post, data: Partial<Post>): Promise<Post> {
    data.updatedAt = Date.now()
    const model = await this.postRepository.update(post, data)
    if (isNotEmpty<PostModel>(model)) return this.toPost(model)
    throw new NotFoundError(`Post with ID ${post.uuid} not found`)
  }

  /**
   * Delete post
   */
  async delete (post: Post): Promise<boolean> {
    return await this.postRepository.delete(post)
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
