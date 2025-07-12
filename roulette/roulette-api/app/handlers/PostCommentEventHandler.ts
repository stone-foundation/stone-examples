import { User } from '../models/User'
import { ListMetadataOptions } from '../models/App'
import { UserService } from '../services/UserService'
import { ILogger, isEmpty, isNotEmpty } from '@stone-js/core'
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
  postCommentService: PostCommentService
}

/**
 * Post Comment Event Handler
 */
@EventHandler('/post-comments', { name: 'postComments', middleware: ['authOrNot'] })
export class PostCommentEventHandler {
  private readonly logger: ILogger
  private readonly userService: UserService
  private readonly postCommentService: PostCommentService

  constructor ({ userService, postCommentService, logger }: PostCommentEventHandlerOptions) {
    this.logger = logger
    this.userService = userService
    this.postCommentService = postCommentService
  }

  /**
   * List all comments
   */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<PostComment>> {
    const result = await this.postCommentService.list(Number(event.get('limit', 10)), event.get('page'))
    result.items = await this.toPostComment(result.items)

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
    result.items = await this.toPostComment(result.items)

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
    const comment = event.get<PostComment>('comment')
    return isNotEmpty<PostCommentModel>(comment) ? this.postCommentService.toPostComment(comment) : undefined
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

    this.logger.info(`Comment deleted: ${comment.uuid}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return { statusCode: 204 }
  }
  
  private toPostComment (result: PostComment[]): Promise<PostComment[]> {
    return Promise.all(result.map(async (comment) => {
      const author = comment.authorUuid ? await this.userService.findByUuid(comment.authorUuid) : undefined
      comment.author = author ? this.userService.toUser(author) : undefined
      return comment
    }))
  }
}
