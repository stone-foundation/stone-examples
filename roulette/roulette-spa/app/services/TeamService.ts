import { Team, TeamStat } from '../models/Team'
import { TeamClient } from '../clients/TeamClient'
import { IContainer, Service } from '@stone-js/core'

/**
 * Team Service Options
*/
export interface TeamServiceOptions {
  teamClient: TeamClient
}

/**
 * Team Service
*/
@Service({ alias: 'teamService' })
export class TeamService {
  private readonly teamClient: TeamClient

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (_key: string, value: any, container: IContainer): Promise<Team | undefined> {
    const teamService = container.resolve<TeamService>('teamService')
    return await teamService.getByName(value)
  }

  /**
   * Create a new Team Service
  */
  constructor ({ teamClient }: TeamServiceOptions) {
    this.teamClient = teamClient
  }

  /**
   * List all posts
   */
  async list (limit?: number, page?: string | number): Promise<Team[]> {
    return await this.teamClient.list(limit, page)
  }

  /**
   * Find a team
   *
   * @param conditions - The conditions to find the team
   * @returns The found team
   */
  async getByName (name: string): Promise<Team> {
    return await this.teamClient.getByName(name)
  }

  /**
   * Results of the team
   *
   * @returns The results of the team
   */
  async results (): Promise<TeamStat[]> {
    return await this.teamClient.results()
  }

  /**
   * Current team
   *
   * @returns The current team
   */
  async currentTeam (): Promise<Team> {
    return await this.teamClient.currentTeam()
  }
  
  /**
   * Update an existing team
   */
  async update (uuid: string, data: Partial<Team>): Promise<Team> {
    return await this.teamClient.update(uuid, data)
  }

  /**
   * Upload a logo for a team
   */
  async changeImage (uuid: string, file: File, type: 'logo' | 'banner'): Promise<void> {
    const { uploadUrl } = await this.teamClient.generateUploadLink(uuid, type)
    await this.teamClient.uploadFileToS3(uploadUrl, file)
  }
}
