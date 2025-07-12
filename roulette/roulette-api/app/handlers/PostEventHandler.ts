import { User } from '../models/User'
import { Post, PostModel } from '../models/Post'
import { ListMetadataOptions } from '../models/App'
import { PostService } from '../services/PostService'
import { TeamService } from '../services/TeamService'
import { UserService } from '../services/UserService'
import { ILogger, isNotEmpty, isEmpty } from '@stone-js/core'
import { PostCommentService } from '../services/PostCommentService'
import { ActivityAssignmentService } from '../services/ActivityAssignmentService'
import { EventHandler, Get, Post as HttpPost, Patch, Delete } from '@stone-js/router'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent, NoContentHttpResponse } from '@stone-js/http-core'

/**
 * Post Event Handler Options
 */
export interface PostEventHandlerOptions {
  logger: ILogger
  userService: UserService
  teamService: TeamService
  postService: PostService
  postCommentService: PostCommentService
  activityAssignmentService: ActivityAssignmentService
}

/**
 * Post Event Handler
 */
@EventHandler('/posts', { name: 'posts', middleware: ['authOrNot'] })
export class PostEventHandler {
  private readonly logger: ILogger
  private readonly userService: UserService
  private readonly teamService: TeamService
  private readonly postService: PostService
  private readonly postCommentService: PostCommentService
  private readonly activityAssignmentService: ActivityAssignmentService

  constructor ({ postService, postCommentService, activityAssignmentService, userService, teamService, logger }: PostEventHandlerOptions) {
    this.logger = logger
    this.teamService = teamService
    this.postService = postService
    this.userService = userService
    this.postCommentService = postCommentService
    this.activityAssignmentService = activityAssignmentService
  }

  /**
   * List all posts
   */
  @Get('/', { name: 'list', middleware: ['authOrNot'] })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<Post>> {
    const result = await this.postService.list(Number(event.get('limit', 10)), event.get('page'))
    result.items = await this.toPost(result.items, event.getUser<User>())

    return result
  }

  /**
   * List all posts by team page
   */
  @Get('/teams/:teamName', { name: 'list', middleware: ['authOrNot'] })
  @JsonHttpResponse(200)
  async listByTeam (event: IncomingHttpEvent): Promise<ListMetadataOptions<Post>> {
    const teamName = event.get<string>('teamName', '')
    const team = await this.teamService.findByName(teamName)
    const result = await this.postService.listBy({ teamUuid: team?.uuid }, Number(event.get('limit', 10)), event.get('page'))
    result.items = await this.toPost(result.items, event.getUser<User>())

    return result
  }

  /**
   * Show a post by uuid
   */
  @Get('/:post@uuid', {
    rules: { post: /\S{30,40}/ },
    bindings: { post: PostService }
  })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<Post | undefined> {
    const post = event.get<Post>('post')
    return isNotEmpty<PostModel>(post) ? this.postService.toPost(post) : undefined
  }

  /**
   * Create a post
   */
  @HttpPost('/', { middleware: ['auth'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const data = event.getBody<Post & { extension: string }>()

    if (isEmpty(data) || isEmpty(data.type) || isEmpty(data.visibility)) {
      throw new BadRequestError('Post type and visibility are required')
    }

    const result = await this.postService.create(data, event.getUser<User>())

    this.logger.info(`Post created: ${result.uuid}, by user: ${String(event.getUser<User>().uuid)}`)

    return result
  }

  /**
   * Toggle like on a post
   */
  @HttpPost('/:post@uuid/like', {
    rules: { post: /\S{30,40}/ },
    bindings: { post: PostService },
    middleware: ['auth']
  })
  @NoContentHttpResponse()
  async like (event: IncomingHttpEvent): Promise<void> {
    const user = event.getUser<User>()
    const post = event.get<Post>('post', {} as unknown as PostModel)
    
    await this.postService.toggleLike(post, user)
    
    this.logger.info(`Post liked: ${post.uuid}, by user: ${String(user.uuid)}`)
  }

  /**
   * Update a post
   */
  @Patch('/:post@uuid', {
    rules: { post: /\S{30,40}/ },
    bindings: { post: PostService },
    middleware: ['auth']
  })
  @JsonHttpResponse(200)
  async update (event: IncomingHttpEvent): Promise<Post> {
    const data = event.getBody<Partial<Post>>({})
    const post = event.get<Post>('post', {} as unknown as PostModel)

    const updated = await this.postService.update(post, data)

    this.logger.info(`Post updated: ${post.uuid}, by user: ${String(event.getUser<User>().uuid)}`)

    return updated
  }

  /**
   * Delete a post
   */
  @Delete('/:post@uuid', {
    rules: { post: /\S{30,40}/ },
    bindings: { post: PostService },
    middleware: ['auth']
  })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const post = event.get<Post>('post', {} as unknown as PostModel)

    await this.postService.delete(post)

    this.logger.info(`Post deleted: ${post.uuid}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return { statusCode: 204 }
  }

  private toPost (result: Post[], user: User): Promise<Post[]> {
    return Promise.all(result.map(async (post) => {
      const comments = post.commentCount > 0 ? (await this.postCommentService.listBy({ postUuid: post.uuid }, 3)).items : []
      const author = post.authorUuid ? await this.userService.findByUuid(post.authorUuid) : undefined
      
      post.likedByMe = (post.likedByUuids as string[])?.includes(user?.uuid ?? '') ?? false
      post.team = post.teamUuid ? await this.teamService.findByUuid(post.teamUuid) : undefined
      post.activityAssignment = post.activityAssignmentUuid ? await this.activityAssignmentService.findByUuid(post.activityAssignmentUuid) : undefined
      
      post.comments = await this.postCommentService.toPostComment(comments, this.userService)
      post.author = author ? this.userService.toUser(author) : undefined
      
      return post
    }))
  }
}
