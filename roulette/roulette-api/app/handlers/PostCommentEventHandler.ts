import { User } from '../models/User'
import { ListMetadataOptions } from '../models/App'
import { ILogger, isEmpty, isNotEmpty } from '@stone-js/core'
import { PostComment, PostCommentModel } from '../models/Post'
import { PostCommentService } from '../services/PostCommentService'
import { EventHandler, Get, Post as HttpPost, Patch, Delete } from '@stone-js/router'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * Post Comment Event Handler Options
 */
export interface PostCommentEventHandlerOptions {
  logger: ILogger
  postCommentService: PostCommentService
}

/**
 * Post Comment Event Handler
 */
@EventHandler('/post-comments', { name: 'postComments' })
export class PostCommentEventHandler {
  private readonly logger: ILogger
  private readonly postCommentService: PostCommentService

  constructor ({ postCommentService, logger }: PostCommentEventHandlerOptions) {
    this.logger = logger
    this.postCommentService = postCommentService
  }

  /**
   * List all comments
   */
  @Get('/', { name: 'list', middleware: ['auth'] })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<PostComment>> {
    return await this.postCommentService.list(Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * List comments for a given post
   */
  @Get('/by-post/:postUuid', { middleware: ['auth'] })
  @JsonHttpResponse(200)
  async listByPost (event: IncomingHttpEvent): Promise<ListMetadataOptions<PostComment>> {
    const postUuid = event.get<string>('postUuid')
    return await this.postCommentService.listBy({ postUuid }, Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * Show a comment
   */
  @Get('/:comment@uuid', {
    rules: { comment: /\S{30,40}/ },
    bindings: { comment: PostCommentService },
    middleware: ['auth']
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
}
