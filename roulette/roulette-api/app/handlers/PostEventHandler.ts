import { User } from '../models/User'
import { Team } from '../models/Team'
import { Post } from '../models/Post'
import { ILogger, isEmpty } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { PostService } from '../services/PostService'
import { TeamService } from '../services/TeamService'
import { EventHandler, Get, Post as HttpPost, Patch, Delete } from '@stone-js/router'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent, NoContentHttpResponse } from '@stone-js/http-core'

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
@EventHandler('/posts', { name: 'posts', middleware: ['auth'] })
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
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<Post>> {
    const missionUuid = event.get<string>('missionUuid')
    return await this.postService.listBy({ missionUuid }, Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * List all posts by team page
   */
  @Get('/teams/:team@uuid', { rules: { team: /\S{30,40}/ }, bindings: { team: TeamService } })
  @JsonHttpResponse(200)
  async listByTeam (event: IncomingHttpEvent): Promise<ListMetadataOptions<Post>> {
    const team = event.get<Team>('team', {} as Team)
    return await this.postService.listBy({ teamUuid: team?.uuid }, Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * Show a post by uuid
   */
  @Get('/:post@uuid', { rules: { post: /\S{30,40}/ }, bindings: { post: PostService } })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<Post | undefined> {
    return event.get<Post>('post')
  }

  /**
   * Create a post
   */
  @HttpPost('/', { middleware: ['auth'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const user = event.getUser<User>()
    const data = event.getBody<Post & { extension: string }>()

    if (isEmpty(data) || isEmpty(data.type) || isEmpty(data.visibility) || isEmpty(data.missionUuid)) {
      throw new BadRequestError('Post type, visibility and mission UUID are required')
    }

    const uuid = await this.postService.create(data, user)

    this.logger.info(`Post created: ${uuid}, by user: ${String(user.uuid)}`)

    return { uuid }
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
    const post = event.get<Post>('post', {} as unknown as Post)
    
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
    const user = event.getUser<User>()
    const data = event.getBody<Partial<Post>>({})
    const post = event.get<Post>('post', {} as unknown as Post)

    const updated = await this.postService.update(post, data, user)

    this.logger.info(`Post updated: ${post.uuid}, by user: ${String(user.uuid)}`)

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
    const user = event.getUser<User>()
    const post = event.get<Post>('post', {} as unknown as Post)

    await this.postService.delete(post, user)

    this.logger.info(`Post deleted: ${post.uuid}, by user: ${String(user.uuid)}`)

    return { statusCode: 204 }
  }
}
