import { User } from '../models/User'
import { ILogger, isEmpty } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { PostService } from '../services/PostService'
import { Post, PostComment, PostCommentModel } from '../models/Post'
import { PostCommentService } from '../services/PostCommentService'
import { EventHandler, Get, Post as HttpPost, Patch, Delete } from '@stone-js/router'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent, NoContentHttpResponse } from '@stone-js/http-core'

/**
 * Post Comment Event Handler Options
 */
export interface PostCommentEventHandlerOptions {
  logger: ILogger
  postService: PostService
  postCommentService: PostCommentService
}

/**
 * Post Comment Event Handler
 */
@EventHandler('/post-comments', { name: 'postComments', middleware: ['authOrNot'] })
export class PostCommentEventHandler {
  private readonly logger: ILogger
  private readonly postService: PostService
  private readonly postCommentService: PostCommentService

  constructor ({ postCommentService, postService, logger }: PostCommentEventHandlerOptions) {
    this.logger = logger
    this.postService = postService
    this.postCommentService = postCommentService
  }

  /**
   * List all comments
   */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<PostComment>> {
    return await this.postCommentService.list(Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * List comments for a given post
   */
  @Get('/posts/:post@uuid', { rules: { post: /\S{30,40}/ }, bindings: { post: PostService } })
  @JsonHttpResponse(200)
  async listByPost (event: IncomingHttpEvent): Promise<ListMetadataOptions<PostComment>> {
    const post = event.get<Post>('post', {} as Post)
    return await this.postCommentService.listBy({ postUuid: post.uuid }, Number(event.get('limit', 10)), event.get('page'))
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
    const user = event.getUser<User>()
    const data = event.getBody<PostComment>()

    if (isEmpty(data) || isEmpty(data?.postUuid) || isEmpty(data?.content)) {
      throw new BadRequestError('Post UUID and comment content are required')
    }

    const uuid = await this.postCommentService.create(data, user)

    await this.postService.incrementCommentCount(data.postUuid, 1, user)

    this.logger.info(`Comment created: ${uuid}, by user: ${String(user.uuid)}`)

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
    const user = event.getUser<User>()
    const data = event.getBody<Partial<PostComment>>({})
    const comment = event.get<PostComment>('comment', {} as unknown as PostCommentModel)

    const updated = await this.postCommentService.update(comment, data, user)

    this.logger.info(`Comment updated: ${comment.uuid}, by user: ${String(user.uuid)}`)

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
    const user = event.getUser<User>()
    const comment = event.get<PostComment>('comment', {} as unknown as PostCommentModel)

    await this.postCommentService.delete(comment, user)

    await this.postService.incrementCommentCount(comment.postUuid, -1, user)

    this.logger.info(`Comment deleted: ${comment.uuid}, by user: ${String(user.uuid)}`)

    return { statusCode: 204 }
  }
}
