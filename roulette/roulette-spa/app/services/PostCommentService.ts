import { Service } from '@stone-js/core'
import { PostComment } from '../models/Post'
import { ListMetadataOptions } from '../models/App'
import { PostCommentClient } from '../clients/PostCommentClient'

/**
 * Post Comment Service Options
 */
export interface PostCommentServiceOptions {
  postCommentClient: PostCommentClient
}

/**
 * Post Comment Service
 */
@Service({ alias: 'postCommentService' })
export class PostCommentService {
  private readonly client: PostCommentClient

  /**
   * Create a new PostCommentService
   */
  constructor ({ postCommentClient }: PostCommentServiceOptions) {
    this.client = postCommentClient
  }

  /**
   * List all comments
   */
  async list (limit?: number, page?: string): Promise<ListMetadataOptions<PostComment>> {
    return await this.client.list(limit, page)
  }

  /**
   * List comments by post UUID
   */
  async listByPost (postUuid: string, limit?: number, page?: string): Promise<ListMetadataOptions<PostComment>> {
    return await this.client.listByPost(postUuid, limit, page)
  }

  /**
   * Get a comment by UUID
   */
  async get (uuid: string): Promise<PostComment> {
    return await this.client.get(uuid)
  }

  /**
   * Create a new comment
   */
  async create (data: Pick<PostComment, 'postUuid' | 'content'>): Promise<{ uuid?: string }> {
    return await this.client.create(data)
  }

  /**
   * Toggle like on a comment
   */
  async toggleLike (uuid: string): Promise<PostComment> {
    return await this.client.toggleLike(uuid)
  }

  /**
   * Update a comment
   */
  async update (uuid: string, data: Partial<PostComment>): Promise<PostComment> {
    return await this.client.update(uuid, data)
  }

  /**
   * Delete a comment
   */
  async delete (uuid: string): Promise<void> {
    return await this.client.delete(uuid)
  }
}
