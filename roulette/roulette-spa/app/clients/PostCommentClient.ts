import { AxiosClient } from './AxiosClient'
import { PostComment } from '../models/Post'
import { IBlueprint, Stone } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'

/**
 * Post Comment Client Options
 */
export interface PostCommentClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Post Comment Client
 */
@Stone({ alias: 'postCommentClient' })
export class PostCommentClient {
  private readonly path: string
  private readonly client: AxiosClient

  constructor ({ blueprint, httpClient }: PostCommentClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.postComment.path', '/post-comments')
  }

  /**
   * List all post comments
   */
  async list (limit: number = 10, page?: string): Promise<ListMetadataOptions<PostComment>> {
    const query = new URLSearchParams({ limit: String(limit), ...(page ? { page } : {}) })
    return await this.client.get<ListMetadataOptions<PostComment>>(`${this.path}/?${query.toString()}`)
  }

  /**
   * List post comments for a given post
   */
  async listByPost (postUuid: string, limit: number = 10, page?: string): Promise<ListMetadataOptions<PostComment>> {
    const query = new URLSearchParams({ limit: String(limit), ...(page ? { page } : {}) })
    return await this.client.get<ListMetadataOptions<PostComment>>(`${this.path}/posts/${postUuid}?${query.toString()}`)
  }

  /**
   * Get a comment by uuid
   */
  async get (uuid: string): Promise<PostComment> {
    return await this.client.get<PostComment>(`${this.path}/${uuid}`)
  }

  /**
   * Create a new comment
   */
  async create (data: Pick<PostComment, 'postUuid' | 'content'>): Promise<{ uuid?: string }> {
    return await this.client.post<{ uuid?: string }>(`${this.path}`, data)
  }

  /**
   * Toggle like on a post
   */
  async toggleLike (uuid: string): Promise<PostComment> {
    return await this.client.post<PostComment>(`${this.path}/${uuid}/like`)
  }

  /**
   * Update a comment
   */
  async update (uuid: string, data: Partial<PostComment>): Promise<PostComment> {
    return await this.client.patch<PostComment>(`${this.path}/${uuid}`, data)
  }

  /**
   * Delete a comment
   */
  async delete (uuid: string): Promise<void> {
    await this.client.delete(`${this.path}/${uuid}`)
  }
}
