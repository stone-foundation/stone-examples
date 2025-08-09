import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { TeamService } from './TeamService'
import { UserService } from './UserService'
import { MediaService } from './MediaService'
import { Post, PostModel } from '../models/Post'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { SecurityService } from './SecurityService'
import { TeamMemberService } from './TeamMemberService'
import { PostCommentService } from './PostCommentService'
import { isNotEmpty, Service, IContainer } from '@stone-js/core'
import { ActivityAssignmentService } from './ActivityAssignmentService'
import { IPostRepository } from '../repositories/contracts/IPostRepository'

/**
 * Post Service Options
 */
export interface PostServiceOptions {
  teamService: TeamService
  userService: UserService
  mediaService: MediaService
  postRepository: IPostRepository
  securityService: SecurityService
  teamMemberService: TeamMemberService
  postCommentService: PostCommentService
  activityAssignmentService: ActivityAssignmentService
}

/**
 * Post Service
 */
@Service({ alias: 'postService' })
export class PostService {
  private readonly userService: UserService
  private readonly teamService: TeamService
  private readonly mediaService: MediaService
  private readonly postRepository: IPostRepository
  private readonly securityService: SecurityService
  private readonly teamMemberService: TeamMemberService
  private readonly postCommentService: PostCommentService
  private readonly activityAssignmentService: ActivityAssignmentService

  constructor ({ teamService, securityService, mediaService, postRepository, userService, teamMemberService, postCommentService, activityAssignmentService }: PostServiceOptions) {
    this.userService = userService
    this.teamService = teamService
    this.mediaService = mediaService
    this.postRepository = postRepository
    this.securityService = securityService
    this.teamMemberService = teamMemberService
    this.postCommentService = postCommentService
    this.activityAssignmentService = activityAssignmentService
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
    const items = await this.toPosts(result.items)
    return { ...result, items }
  }

  /**
   * List posts by conditions
   */
  async listBy (conditions: Partial<PostModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Post>> {
    const result = await this.postRepository.listBy(conditions, limit, page)
    const items = await this.toPosts(result.items)
    return { ...result, items }
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


  async toPost (model: PostModel): Promise<Post> {
    const author = await this.userService.findByUuid(model.authorUuid)
    const commentMeta = await this.postCommentService.listBy({ postUuid: model.uuid }, 3)
    const team = model.teamUuid ? await this.teamService.findByUuid(model.teamUuid) : undefined
    const teamMember = model.teamMemberUuid ? await this.teamMemberService.findByUuid(model.teamMemberUuid) : undefined
    const activityAssignment = model.activityAssignmentUuid ? await this.activityAssignmentService.findByUuid(model.activityAssignmentUuid) : undefined
    
    const likedByMe = Array().concat(model.likedByUuids ?? []).includes(this.securityService.getAuthUser()?.uuid ?? '')

    if (isNotEmpty<User>(author)) {
      const authorMember = await this.teamMemberService.findBy({ userUuid: model.authorUuid, missionUuid: model.missionUuid })
      author.username = authorMember?.name ?? author?.fullname.split(' ')[0] ?? 'Unknown'
    }
    
    return {
      ...model,
      team,
      author,
      likedByMe,
      teamMember,
      activityAssignment,
      comments: commentMeta.items,
    }
  }

  toPosts (models: PostModel[]): Promise<Post[]> {
    return Promise.all(models.map(model => this.toPost(model)))
  }
}
