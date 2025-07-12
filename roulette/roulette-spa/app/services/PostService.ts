import { Post } from '../models/Post'
import { Service } from '@stone-js/core'
import { PostClient } from '../clients/PostClient'
import { ListMetadataOptions } from '../models/App'

/**
 * Post Service Options
 */
export interface PostServiceOptions {
  postClient: PostClient
}

/**
 * Post Service
 */
@Service({ alias: 'postService' })
export class PostService {
  private readonly client: PostClient

  /**
   * Create a new PostService
   */
  constructor ({ postClient }: PostServiceOptions) {
    this.client = postClient
  }

  /**
   * List all posts
   */
  async list (limit?: number, page?: string | number): Promise<ListMetadataOptions<Post>> {
    return await this.client.list(limit, page)
  }

  /**
   * List posts by team
   */
  async listByTeam (teamName: string, limit?: number, page?: string | number): Promise<ListMetadataOptions<Post>> {
    return await this.client.listByTeam(teamName, limit, page)
  }

  /**
   * Get a post by UUID
   */
  async get (uuid: string): Promise<Post> {
    return await this.client.get(uuid)
  }

  /**
   * Create a new post
   */
  async create (data: Partial<Post & { extension: string }>): Promise<{ uuid?: string, uploadUrl?: string, publicUrl?: string, key?: string }> {
    const result = await this.client.create({ ...data, image: undefined })

    if (data.type === 'image' && result.uploadUrl !== undefined && data.image instanceof File) {
      await this.uploadToS3(result.uploadUrl, data.image)
    }

    return result
  }

  /**
   * Upload a file to S3 via pre-signed URL
   */
  async uploadToS3 (uploadUrl: string, file: File): Promise<void> {
    return await this.client.uploadFileToS3(uploadUrl, file)
  }

  /**
   * Toggle like on a post
   */
  async toggleLike (uuid: string): Promise<Post> {
    return await this.client.toggleLike(uuid)
  }

  /**
   * Update an existing post
   */
  async update (uuid: string, data: Partial<Post>): Promise<Post> {
    return await this.client.update(uuid, data)
  }

  /**
   * Delete a post
   */
  async delete (uuid: string): Promise<void> {
    return await this.client.delete(uuid)
  }
}
