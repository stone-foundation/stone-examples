import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { Post, PostModel } from '../models/Post'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { IPostRepository } from '../repositories/contracts/IPostRepository'
import { isNotEmpty, Service, IContainer, IBlueprint } from '@stone-js/core'

/**
 * Post Service Options
 */
export interface PostServiceOptions {
  s3Client: S3Client
  blueprint: IBlueprint
  postRepository: IPostRepository
}

/**
 * Post Service
 */
@Service({ alias: 'postService' })
export class PostService {
  private readonly s3Client: S3Client
  private readonly blueprint: IBlueprint
  private readonly postRepository: IPostRepository

  constructor ({ s3Client, blueprint, postRepository }: PostServiceOptions) {
    this.s3Client = s3Client
    this.blueprint = blueprint
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
  async create (post: Post, author: User): Promise<Record<string, string>> {
    const now = Date.now()
    const uuid = randomUUID()
    const urls = post.type === 'image' ? await this.generateUploadUrls({ ...post, uuid }) : undefined

    await this.postRepository.create({
      ...post,
      uuid,
      imageUrl: urls?.publicUrl,
      authorUuid: author.uuid,
      createdAt: now,
      updatedAt: now,
      likeCount: 0,
      commentCount: 0
    })
    
    return { uuid, ...urls }
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
   * Count total posts
   */
  async count (): Promise<number> {
    return await this.postRepository.count()
  }

  /**
   * Increment comment count for a post
   */
  async incrementCommentCount (postUuid: string, increment: number = 1): Promise<void> {
    const post = await this.postRepository.findByUuid(postUuid)
    if (!post) {
      throw new NotFoundError(`Post with UUID ${postUuid} not found`)
    }
    post.commentCount += increment
    await this.postRepository.update(post, { commentCount: post.commentCount })
  }

  /**
   * Generate upload URLs for user avatar
   *
   * @param user - The user for whom to generate the upload URLs
   * @param extension - The file extension for the avatar (default is 'png')
   * @returns An object containing the upload URL, public URL, and key for the avatar
   */
  async generateUploadUrls (post: Post, extension: string = 'png'): Promise<{ uploadUrl: string, publicUrl: string, key: string }> {
    const bucketName = this.blueprint.get<string>('aws.s3.bucketName', 'posts')
    const expiresIn = this.blueprint.get<number>('aws.s3.signedUrlExpireSeconds', 300)
    const s3BucketFolder = this.blueprint.get<string>('aws.s3.postsFolderName', 'posts')
    const cloudfrontStaticUrl = this.blueprint.get<string>('aws.cloudfront.distStaticName', 'static')
    const key = `${s3BucketFolder}/${post.uuid}/image.${extension}`

    const command = new PutObjectCommand({
      Key: key,
      Bucket: bucketName,
      ContentType: `image/${extension}`
    })

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn })

    const publicUrl = `${cloudfrontStaticUrl}/${key}`

    return { uploadUrl, publicUrl, key }
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
