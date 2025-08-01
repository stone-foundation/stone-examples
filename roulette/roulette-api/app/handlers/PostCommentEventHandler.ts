import { User } from '../models/User'
import { ILogger, isEmpty } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { UserService } from '../services/UserService'
import { PostService } from '../services/PostService'
import { PostComment, PostCommentModel } from '../models/Post'
import { PostCommentService } from '../services/PostCommentService'
import { EventHandler, Get, Post as HttpPost, Patch, Delete } from '@stone-js/router'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent, NoContentHttpResponse } from '@stone-js/http-core'

/**
 * Post Comment Event Handler Options
 */
export interface PostCommentEventHandlerOptions {
  logger: ILogger
  userService: UserService
  postService: PostService
  postCommentService: PostCommentService
}

/**
 * Post Comment Event Handler
 */
@EventHandler('/post-comments', { name: 'postComments', middleware: ['authOrNot'] })
export class PostCommentEventHandler {
  private readonly logger: ILogger
  private readonly userService: UserService
  private readonly postService: PostService
  private readonly postCommentService: PostCommentService

  constructor ({ userService, postService, postCommentService, logger }: PostCommentEventHandlerOptions) {
    this.logger = logger
    this.userService = userService
    this.postService = postService
    this.postCommentService = postCommentService
  }

  /**
   * List all comments
   */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<PostComment>> {
    const result = await this.postCommentService.list(Number(event.get('limit', 10)), event.get('page'))
    result.items = await this.postCommentService.toPostComment(result.items, this.userService)

    return result
  }

  /**
   * List comments for a given post
   */
  @Get('/by-post/:postUuid')
  @JsonHttpResponse(200)
  async listByPost (event: IncomingHttpEvent): Promise<ListMetadataOptions<PostComment>> {
    const postUuid = event.get<string>('postUuid')
    const result = await this.postCommentService.listBy({ postUuid }, Number(event.get('limit', 10)), event.get('page'))
    result.items = await this.postCommentService.toPostComment(result.items, this.userService)

    return result
  }

  /**
   * Show a comment
   */
  @Get('/:comment@uuid', {
    rules: { comment: /\S{30,40}/ },
    bindings: { comment: PostCommentService }
  })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<PostComment | undefined> {
    return event.get<PostCommentModel>('comment')
  }

  /**
   * Create a comment
   */
  @HttpPost('/', { middleware: ['auth'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const data = event.getBody<PostComment>()

    if (isEmpty(data) || isEmpty(data?.postUuid) || isEmpty(data?.content)) {
      throw new BadRequestError('Post UUID and comment content are required')
    }

    const uuid = await this.postCommentService.create(data, event.getUser<User>())

    await this.postService.incrementCommentCount(data.postUuid, 1)

    this.logger.info(`Comment created: ${uuid}, by user: ${String(event.getUser<User>().uuid)}`)

    return { uuid }
  }

  /**
   * Toggle like on a post
   */
  @HttpPost('/:comment@uuid/like', {
    rules: { comment: /\S{30,40}/ },
    bindings: { comment: PostCommentService },
    middleware: ['auth']
  })
  @NoContentHttpResponse()
  async like (event: IncomingHttpEvent): Promise<void> {
    const user = event.getUser<User>()
    const post = event.get<PostComment>('comment', {} as unknown as PostComment)
    
    await this.postCommentService.toggleLike(post, user)
    
    this.logger.info(`Comment liked: ${post.uuid}, by user: ${String(user.uuid)}`)
  }

  /**
   * Update a comment
   */
  @Patch('/:comment@uuid', {
    rules: { comment: /\S{30,40}/ },
    bindings: { comment: PostCommentService },
    middleware: ['auth']
  })
  @JsonHttpResponse(200)
  async update (event: IncomingHttpEvent): Promise<PostComment> {
    const data = event.getBody<Partial<PostComment>>({})
    const comment = event.get<PostComment>('comment', {} as unknown as PostCommentModel)

    const updated = await this.postCommentService.update(comment, data)

    this.logger.info(`Comment updated: ${comment.uuid}, by user: ${String(event.getUser<User>().uuid)}`)

    return updated
  }

  /**
   * Delete a comment
   */
  @Delete('/:comment@uuid', {
    rules: { comment: /\S{30,40}/ },
    bindings: { comment: PostCommentService },
    middleware: ['auth']
  })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const comment = event.get<PostComment>('comment', {} as unknown as PostCommentModel)

    await this.postCommentService.delete(comment)

    await this.postService.incrementCommentCount(comment.postUuid, -1)

    this.logger.info(`Comment deleted: ${comment.uuid}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return { statusCode: 204 }
  }
}
