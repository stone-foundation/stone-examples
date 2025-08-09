import { User } from '../models/User'
import { Team } from '../models/Team'
import { ListMetadataOptions } from '../models/App'
import { TeamService } from '../services/TeamService'
import { ILogger, isEmpty, isNotEmpty } from '@stone-js/core'
import { Delete, EventHandler, Get, Patch, Post } from '@stone-js/router'
import { BadRequestError, IncomingHttpEvent, JsonHttpResponse } from '@stone-js/http-core'

/**
 * Team Event Handler Options
*/
export interface TeamEventHandlerOptions {
  logger: ILogger
  teamService: TeamService
}

/**
 * Team Event Handler
*/
@EventHandler('/teams', { name: 'teams', middleware: ['auth'] })
export class TeamEventHandler {
  private readonly logger: ILogger
  private readonly teamService: TeamService

  /**
   * Create a new instance of TeamEventHandler
   *
   * @param teamService
   * @param logger
   */
  constructor ({ logger, teamService }: TeamEventHandlerOptions) {
    this.logger = logger
    this.teamService = teamService
  }

  /**
   * List all teams
  */
  @Get('/', { name: 'list' })
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<Team>> {
    const missionUuid = event.get<string>('missionUuid')
    return await this.teamService.listBy({ missionUuid }, event.get<number>('limit', 10))
  }

  /**
   * Show a team
   *
   * @param event - IncomingHttpEvent
   * @returns Team
  */
  @Get('/:team@uuid', { rules: { team: /\S{30,40}/ }, bindings: { team: TeamService } })
  async show (event: IncomingHttpEvent): Promise<Team | undefined> {
    return event.get<Team>('team')
  }

  /**
   * Show my team
   *
   * @param event - IncomingHttpEvent
   * @returns Team
  */
  @Get('/users/me')
  async showMyTeam (event: IncomingHttpEvent): Promise<Team | undefined> {
    const user = event.getUser<User>()
    const missionUuid = event.get<string>('missionUuid')
    return await this.teamService.findBy({ userUuid: user.uuid, missionUuid, isActive: true })
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
    const user = event.getUser<User>()
    const data = await this.validateTeamData(event.getBody<Team>(), true)
    const uuid = await this.teamService.create(data, user)

    this.logger.info(`Team created: ${String(uuid)}, by user: ${String(user?.uuid)}`)

    return { uuid }
  }

  /**
   * Update a team
   *
   * With explicit rules definition.
  */
  @Patch('/:team@uuid', { rules: { team: /\S{30,40}/ }, bindings: { team: TeamService }, middleware: ['captain'] })
  @JsonHttpResponse(201)
  async update (event: IncomingHttpEvent): Promise<Team> {
    const user = event.getUser<User>()
    const data = await this.validateTeamData(event.getBody<Team>())
    const team = event.get<Team>('team', {} as unknown as Team)

    const updated = await this.teamService.update(team, data, user)

    this.logger.info(`Team updated: ${team.uuid}, by user: ${String(user?.uuid)}`)

    return updated
  }

  /**
   * Delete a team
   *
   * Explcitily returning a status code.
  */
  @Delete('/:team@uuid', { rules: { team: /\S{30,40}/ }, bindings: { team: TeamService }, middleware: ['admin'] })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const user = event.getUser<User>()
    const team = event.get<Team>('team', {} as unknown as Team)

    await this.teamService.delete(team, user)

    this.logger.info(`Team deleted: ${team.uuid}, by user: ${String(user?.uuid)}`)

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

    if (isNotEmpty<Team>(team)) {
      throw new BadRequestError(`Team with name "${data.name}" already exists`)
    }

    if (isCreation && isEmpty(data.name) && isEmpty(data.missionUuid)) {
      throw new BadRequestError('Team name and mission UUID are required')
    }

    return data
  }
}
