import { Post } from '../models/Post'
import { MediaService } from './MediaService'
import { PostClient } from '../clients/PostClient'
import { ListMetadataOptions } from '../models/App'
import { isNotEmpty, Service } from '@stone-js/core'

/**
 * Post Service Options
 */
export interface PostServiceOptions {
  postClient: PostClient
  mediaService: MediaService
}

/**
 * Post Service
 */
@Service({ alias: 'postService' })
export class PostService {
  private readonly client: PostClient
  private readonly mediaService: MediaService

  /**
   * Create a new PostService
   */
  constructor ({ postClient, mediaService }: PostServiceOptions) {
    this.client = postClient
    this.mediaService = mediaService
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
  async create (data: Partial<Post>, file?: File): Promise<{ uuid?: string }> {
    const imageUrl = await this.uploadFile('posts', file)
    return await this.client.create({ ...data, imageUrl })
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
  async update (uuid: string, data: Partial<Post>, file?: File): Promise<Post> {
    const imageUrl = await this.uploadFile('posts', file)
    return await this.client.update(uuid, { ...data, imageUrl })
  }

  /**
   * Delete a post
   */
  async delete (uuid: string): Promise<void> {
    return await this.client.delete(uuid)
  }

  /**
   * Upload a file to the media service
   * 
   * @param group - The group to upload the file to
   * @param file - The file to upload
   * @returns The URL of the uploaded file
   */
  private async uploadFile(group: string, file?: File): Promise<string | undefined> {
    return isNotEmpty<File>(file) ? await this.mediaService.uploadFile(file, group) : undefined
  }
}
