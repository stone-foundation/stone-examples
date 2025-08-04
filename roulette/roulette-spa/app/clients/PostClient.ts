import { Post } from '../models/Post'
import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'

/**
 * Post Client Options
 */
export interface PostClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Post Client
 */
@Stone({ alias: 'postClient' })
export class PostClient {
  private readonly path: string
  private readonly client: AxiosClient

  constructor ({ blueprint, httpClient }: PostClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.post.path', '/posts')
  }

  /**
   * List all posts
   */
  async list (limit: number = 10, page?: string | number): Promise<ListMetadataOptions<Post>> {
    const query = new URLSearchParams({ limit: String(limit), page: String(page ?? '') })
    return await this.client.get<ListMetadataOptions<Post>>(`${this.path}/?${query.toString()}`)
  }

  /**
   * List posts by team
   */
  async listByTeam (teamName: string, limit: number = 10, page?: string | number): Promise<ListMetadataOptions<Post>> {
    const query = new URLSearchParams({ limit: String(limit), page: String(page ?? '') })
    return await this.client.get<ListMetadataOptions<Post>>(`${this.path}/teams/${teamName}?${query.toString()}`)
  }

  /**
   * Get a post by uuid
   */
  async get (uuid: string): Promise<Post> {
    return await this.client.get<Post>(`${this.path}/${uuid}`)
  }

  /**
   * Create a new post
   */
  async create (data: Partial<Post & { extension: string }>): Promise<{ uuid?: string, uploadUrl?: string, publicUrl?: string, key?: string }> {
    return await this.client.post(`${this.path}`, data)
  }

  /**
   * Toggle like on a post
   */
  async toggleLike (uuid: string): Promise<Post> {
    return await this.client.post<Post>(`${this.path}/${uuid}/like`)
  }

  /**
   * Update an existing post
   */
  async update (uuid: string, data: Partial<Post>): Promise<Post> {
    return await this.client.patch<Post>(`${this.path}/${uuid}`, data)
  }

  /**
   * Delete a post
   */
  async delete (uuid: string): Promise<void> {
    await this.client.delete(`${this.path}/${uuid}`)
  }
}
