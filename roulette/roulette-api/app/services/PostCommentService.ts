import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { UserService } from './UserService'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { TeamMemberService } from './TeamMemberService'
import { PostComment, PostCommentModel } from '../models/Post'
import { isNotEmpty, Service, IContainer } from '@stone-js/core'
import { IPostCommentRepository } from '../repositories/contracts/IPostCommentRepository'

/**
 * PostComment Service Options
 */
export interface PostCommentServiceOptions {
  userService: UserService
  teamMemberService: TeamMemberService
  postCommentRepository: IPostCommentRepository
}

/**
 * PostComment Service
 */
@Service({ alias: 'postCommentService' })
export class PostCommentService {
  private readonly userService: UserService
  private readonly teamMemberService: TeamMemberService
  private readonly postCommentRepository: IPostCommentRepository

  constructor ({ userService, teamMemberService, postCommentRepository }: PostCommentServiceOptions) {
    this.userService = userService
    this.teamMemberService = teamMemberService
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
    const items = await this.toPostComments(result.items)
    return { ...result, items }
  }

  /**
   * List comments by conditions
   */
  async listBy (conditions: Partial<PostCommentModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<PostComment>> {
    const result = await this.postCommentRepository.listBy(conditions, limit, page)
    const items = await this.toPostComments(result.items)
    return { ...result, items }
  }

  /**
   * Find comment by uuid
   */
  async findByUuid (uuid: string): Promise<PostComment | undefined> {
    const model = await this.postCommentRepository.findByUuid(uuid)
    if (isNotEmpty<PostCommentModel>(model)) return this.toPostComment(model)
    throw new NotFoundError(`Comment with UUID ${uuid} not found`)
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
    }, author)
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
    }, user)
  }

  /**
   * Update comment
   */
  async update (comment: PostComment, data: Partial<PostComment>, author: User): Promise<PostComment> {
    data.updatedAt = Date.now()
    const model = await this.postCommentRepository.update(comment, data, author)
    if (isNotEmpty<PostCommentModel>(model)) return this.toPostComment(model)
    throw new NotFoundError(`Comment with ID ${comment.uuid} not found`)
  }

  /**
   * Delete comment
   */
  async delete (comment: PostComment, author: User): Promise<boolean> {
    return await this.postCommentRepository.delete(comment, author)
  }

  async toPostComment (model: PostCommentModel): Promise<PostComment> {
    const author = await this.userService.findByUuid(model.authorUuid)
    if (isNotEmpty<User>(author)) {
      const authorMember = await this.teamMemberService.findBy({ userUuid: model.authorUuid, missionUuid: model.missionUuid })
      author.username = authorMember?.name ?? author?.fullname.split(' ')[0] ?? 'Unknown'
    }
    return {
      ...model,
      author
    }
  }

  async toPostComments (result: PostComment[]): Promise<PostComment[]> {
    return Promise.all(result.map(async (comment) => {
      comment.author = comment.authorUuid ? await this.userService.findByUuid(comment.authorUuid) : undefined
      if (isNotEmpty<User>(comment.author)) {
        const authorMember = await this.teamMemberService.findBy({ userUuid: comment.authorUuid, missionUuid: comment.missionUuid })
        comment.author.username = authorMember?.name ?? comment.author?.fullname.split(' ')[0] ?? 'Unknown'
      }
      return comment
    }))
  }
}
