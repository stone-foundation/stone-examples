import { convertCSVtoJSON } from '../utils'
import { User, UserModel } from '../models/User'
import { UserService } from '../services/UserService'
import { TeamService } from '../services/TeamService'
import { ILogger, isEmpty, isNotEmpty } from '@stone-js/core'
import { Delete, EventHandler, Get, Patch, Post } from '@stone-js/router'
import { BadRequestError, IncomingHttpEvent, JsonHttpResponse } from '@stone-js/http-core'

/**
 * User Event Handler Options
*/
export interface UserEventHandlerOptions {
  logger: ILogger
  teamService: TeamService
  userService: UserService
}

/**
 * User Event Handler
*/
@EventHandler('/users', { name: 'users', middleware: ['auth'] })
export class UserEventHandler {
  private readonly logger: ILogger
  private readonly teamService: TeamService
  private readonly userService: UserService

  /**
   * Create a new instance of UserEventHandler
   *
   * @param userService
   * @param logger
   */
  constructor ({ logger, teamService, userService }: UserEventHandlerOptions) {
    this.logger = logger
    this.teamService = teamService
    this.userService = userService
  }

  /**
   * List all users
   *
   * With explicit json response type.
  */
  @Get('/private-list', { name: 'list', middleware: ['admin'] })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<UserModel[]> {
    return await this.userService.sensitiveList(event.get<number>('limit', 10))
  }

  /**
   * List all users
   *
   * With explicit json response type.
  */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async publicList (event: IncomingHttpEvent): Promise<Partial<User>[]> {
    const currentUser = event.getUser<UserModel>()
    const teams = await this.teamService.list(event.get<number>('limit', 10))
    const users = await this.userService.sensitiveList(event.get<number>('limit', 10))

    return users.filter(v => !v.roles?.includes('admin')).map(v => {
      const user: Partial<User> = this.userService.toUser(v)
      user.team = teams.find(team => team.uuid === user.teamUuid)
      user.phone = currentUser.roles?.includes('admin') ? user.phone : undefined
      user.fullname = currentUser.roles?.includes('admin') ? user.fullname : undefined
      return user
    })
  }

  /**
   * Show current user
   *
   * @param event - IncomingHttpEvent
   * @returns User
  */
  @Get('/me')
  showCurrent (event: IncomingHttpEvent): User | undefined {
    const user = event.getUser<UserModel>()
    return isNotEmpty<UserModel>(user) ? this.userService.toUser(user) : undefined
  }

  /**
   * Show a user
   *
   * @param event - IncomingHttpEvent
   * @returns User
  */
  @Get('/:user@uuid', { rules: { user: /\S{30,40}/ }, bindings: { user: UserService }, middleware: ['admin'] })
  show (event: IncomingHttpEvent): UserModel | undefined {
    return event.get<UserModel>('user')
  }

  /**
   * Create a user
  */
  @Post('/', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const data = await this.validateUserData(event.getBody<User>(), true)

    const uuid = await this.userService.create(data)

    this.logger.info(`User created: ${String(uuid)}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return { uuid }
  }

  /**
   * Create a user
  */
  @Post('/from-csv', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async createManyFromCSV (event: IncomingHttpEvent): Promise<{ uuids?: Array<string | undefined> }> {
    const tmpFile = event.getFile('file')?.[0]

    if (isEmpty(tmpFile) || !tmpFile.isValid()) {
      throw new BadRequestError('Invalid file')
    }

    const users = convertCSVtoJSON<Array<Record<string, any>>>(tmpFile.getContent() ?? '').map<User>(v => {
      return {
        username: v['Nom de Soldat'],
        fullname: `${String(v.Prenom)} ${String(v.Nom)}`,
        phone: v['Numero de Telephone'].replace(/\+1\((\d{3})\)\s*(\d{3})-(\d{4})/, '$1-$2-$3')
      } as unknown as User
    })

    tmpFile.remove(true)

    const uuids = await this.userService.createMany(users)

    this.logger.info(`User created: ${String(uuids.join(', '))}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return { uuids }
  }

  /**
   * Update a user
   *
   * With explicit rules definition.
  */
  @Patch('/:user@uuid', { rules: { uuid: /\S{30,40}/ }, bindings: { user: UserService }, middleware: ['admin'] })
  @JsonHttpResponse(201)
  async update (event: IncomingHttpEvent): Promise<User> {
    const data = await this.validateUserData(event.getBody<User>())
    const user = event.get<User>('user', {} as unknown as User)

    const updated = await this.userService.update(user, data)

    this.logger.info(`User updated: ${user.uuid}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return updated
  }

  /**
   * Delete a user
   *
   * Explcitily returning a status code.
  */
  @Delete('/:user@uuid', { rules: { uuid: /\S{30,40}/ }, bindings: { user: UserService }, middleware: ['admin'] })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    if (event.getUser<User>()?.uuid === event.get<string>('uuid', '')) {
      throw new BadRequestError('You cannot delete yourself')
    }

    const user = event.get<User>('user', {} as unknown as User)

    await this.userService.delete(user)

    this.logger.info(`User deleted: ${user.uuid}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return { statusCode: 204 }
  }

  /**
   * Validate user data
   *
   * @param data - User data to validate
   * @throws BadRequestError if validation fails
  */
  private async validateUserData (data?: User, isCreation: boolean = false): Promise<User> {
    if (isEmpty(data)) {
      throw new BadRequestError('User data is required')
    }

    const user = await this.userService.findByPhone(data.phone)
    const user2 = await this.userService.findByUsername(data.username)

    if (isNotEmpty(user)) {
      throw new BadRequestError(`User with phone ${data.phone} already exists`)
    }

    if (isNotEmpty(user2)) {
      throw new BadRequestError(`User with username ${data.username} already exists`)
    }

    if (isCreation && isEmpty(data.username)) {
      throw new BadRequestError('Username is required')
    }

    if (isCreation && isEmpty(data.fullname)) {
      throw new BadRequestError('Fullname is required')
    }

    if (isCreation && isEmpty(data.phone)) {
      throw new BadRequestError('Phone is required')
    }

    return data
  }
}
