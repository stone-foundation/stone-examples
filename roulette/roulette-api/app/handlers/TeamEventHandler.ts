import { User } from '../models/User'
import { Team } from '../models/Team'
import { TeamService } from '../services/TeamService'
import { UserService } from '../services/UserService'
import { Delete, EventHandler, Get, Patch, Post } from '@stone-js/router'
import { IBlueprint, ILogger, isEmpty, isNotEmpty } from '@stone-js/core'
import { BadRequestError, IncomingHttpEvent, JsonHttpResponse, NotFoundError } from '@stone-js/http-core'

/**
 * Team Event Handler Options
*/
export interface TeamEventHandlerOptions {
  logger: ILogger
  blueprint: IBlueprint
  teamService: TeamService
  userService: UserService
}

/**
 * Team Event Handler
*/
@EventHandler('/teams', { name: 'teams', middleware: ['auth'] })
export class TeamEventHandler {
  private readonly logger: ILogger
  private readonly blueprint: IBlueprint
  private readonly teamService: TeamService
  private readonly userService: UserService

  /**
   * Create a new instance of TeamEventHandler
   *
   * @param teamService
   * @param logger
   */
  constructor ({ logger, blueprint, userService, teamService }: TeamEventHandlerOptions) {
    this.logger = logger
    this.blueprint = blueprint
    this.teamService = teamService
    this.userService = userService
  }

  /**
   * List all teams
  */
  @Get('/', { name: 'list', middleware: ['admin'] })
  async list (event: IncomingHttpEvent): Promise<Team[]> {
    const teamsData = await this.teamService.list(event.get<number>('limit', 10))

    return Promise.all(teamsData.map(async (team) => {
      const members = await this.userService.listBy({ teamUuid: team.uuid }, 100)
      team.members = members.map(v => this.teamService.toTeamMember(v))
      return team
    }))
  }

  /**
   * Show team results
  */
  @Get('/results', { name: 'results' })
  async results (): Promise<Array<Partial<Team>>> {
    const limit = this.blueprint.get<number>('app.team.defaultTotalMember', 10)
    return (await this.teamService.list(limit)).map(v => this.teamService.toStatTeam(v))
  }

  /**
   * Show current team
   *
   * @param event - IncomingHttpEvent
   * @returns Team
  */
  @Get('/me')
  async showCurrent (event: IncomingHttpEvent): Promise<Partial<Team>> {
    const limit = this.blueprint.get<number>('app.team.defaultTotalMember', 10)
    const team = await this.teamService.findByUuid(event.getUser<User>()?.teamUuid ?? '')

    if (isEmpty(team)) {
      throw new NotFoundError('Team not found')
    }

    const members = await this.userService.listBy({ teamUuid: team?.uuid }, limit)
    team.members = members.map(v => this.teamService.toTeamMember(v))

    return this.teamService.toStatTeam(team, true)
  }

  /**
   * Show a team
   *
   * @param event - IncomingHttpEvent
   * @returns Team
  */
  @Get('/:team@uuid', { rules: { team: /\S{30,40}/ }, bindings: { team: TeamService } })
  async show (event: IncomingHttpEvent): Promise<Team | undefined> {
    const team = event.get<Team>('team')
    const limit = this.blueprint.get<number>('app.team.defaultTotalMember', 10)
    const members = await this.userService.listBy({ teamUuid: team?.uuid }, limit)

    if (isNotEmpty<Team>(team)) { team.members = members.map(v => this.teamService.toTeamMember(v)) }

    return team
  }


  /**
   * Show a team
   *
   * @param event - IncomingHttpEvent
   * @returns Team
  */
  @Get('/by-name/:team@name', { rules: { team: /\S{0,40}/ }, bindings: { team: TeamService } })
  async showByName (event: IncomingHttpEvent): Promise<Team | undefined> {
    return await this.show(event)
  }

  /**
   * Create a team
  */
  @Post('/', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const data = await this.validateTeamData(event.getBody<Team>(), true)
    const uuid = await this.teamService.create(data)

    this.logger.info(`Team created: ${String(uuid)}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return { uuid }
  }

  /**
   * Update a team
   *
   * With explicit rules definition.
  */
  @Patch('/:team@uuid', { rules: { team: /\S{30,40}/ }, bindings: { team: TeamService }, middleware: ['admin', 'captain'] })
  @JsonHttpResponse(201)
  async update (event: IncomingHttpEvent): Promise<Team> {
    const data = await this.validateTeamData(event.getBody<Team>())
    const team = event.get<Team>('team', {} as unknown as Team)

    const updated = await this.teamService.update(team, data)

    this.logger.info(`Team updated: ${team.uuid}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return updated
  }

  /**
   * Generate signed URL for team asset (logo or banner)
   */
  @Post('/:team@uuid/upload', { rules: { team: /\S{30,40}/ }, bindings: { team: TeamService } })
  @JsonHttpResponse(200)
  async generateUploadLink (event: IncomingHttpEvent): Promise<{ uploadUrl: string, publicUrl: string }> {
    const user = event.getUser<User>()
    const team = event.get<Team>('team', {} as unknown as Team)
    const data = event.getBody<{ type: 'logo' | 'banner', extension: string }>()

    if (team.captainUuid !== user?.uuid && !user.roles?.includes('admin')) {
      throw new BadRequestError('You are not the captain of this team')
    }

    return await this.teamService.generateUploadUrls(team, data?.type ?? 'logo', data?.extension ?? 'png')
  }

  /**
   * Delete a team
   *
   * Explcitily returning a status code.
  */
  @Delete('/:team@uuid', { rules: { team: /\S{30,40}/ }, bindings: { team: TeamService }, middleware: ['admin'] })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const team = event.get<Team>('team', {} as unknown as Team)

    await this.teamService.delete(team)

    this.logger.info(`Team deleted: ${team.uuid}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return { statusCode: 204 }
  }

  /**
   * Validate team data
   *
   * @param data - Team data to validate
   * @throws BadRequestError if validation fails
   */
  private async validateTeamData (data?: Team, isCreation: boolean = false): Promise<Team> {
    if (isEmpty(data)) {
      throw new BadRequestError('Team data is required')
    }

    const team = await this.teamService.findByName(data.name)
    const team2 = await this.teamService.findByColor(data.color)

    if (isNotEmpty<Team>(team)) {
      throw new BadRequestError(`Team with name "${data.name}" already exists`)
    }

    if (isNotEmpty<Team>(team2)) {
      throw new BadRequestError(`Team with color "${data.color}" already exists`)
    }

    if (isCreation && isEmpty(data.name)) {
      throw new BadRequestError('Team name is required')
    }

    if (isCreation && isEmpty(data.color)) {
      throw new BadRequestError('Team color is required')
    }

    return data
  }
}
