import { User } from '../models/User'
import { Post, PostModel } from '../models/Post'
import { ListMetadataOptions } from '../models/App'
import { PostService } from '../services/PostService'
import { ILogger, isNotEmpty, isEmpty } from '@stone-js/core'
import { EventHandler, Get, Post as HttpPost, Patch, Delete } from '@stone-js/router'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * Post Event Handler Options
 */
export interface PostEventHandlerOptions {
  logger: ILogger
  postService: PostService
}

/**
 * Post Event Handler
 */
@EventHandler('/posts', { name: 'posts' })
export class PostEventHandler {
  private readonly logger: ILogger
  private readonly postService: PostService

  constructor ({ postService, logger }: PostEventHandlerOptions) {
    this.logger = logger
    this.postService = postService
  }

  /**
   * List all posts
   */
  @Get('/', { name: 'list', middleware: ['auth'] })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<Post>> {
    return await this.postService.list(Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * List all posts by team page
   */
  @Get('/teams/:team', { name: 'list', middleware: ['auth'] })
  @JsonHttpResponse(200)
  async listByTeam (event: IncomingHttpEvent): Promise<ListMetadataOptions<Post>> {
    return await this.postService.list(Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * Show a post by uuid
   */
  @Get('/:post@uuid', {
    rules: { post: /\S{30,40}/ },
    bindings: { post: PostService },
    middleware: ['auth']
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
    const data = event.getBody<Post>()

    if (isEmpty(data) || isEmpty(data.type) || isEmpty(data.visibility)) {
      throw new BadRequestError('Post type and visibility are required')
    }

    const uuid = await this.postService.create(data, event.getUser<User>())

    this.logger.info(`Post created: ${uuid}, by user: ${String(event.getUser<User>().uuid)}`)

    return { uuid }
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
}
