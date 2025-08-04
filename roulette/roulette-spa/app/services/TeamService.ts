import { MediaService } from './MediaService'
import { Team, TeamStat } from '../models/Team'
import { TeamClient } from '../clients/TeamClient'
import { IContainer, isNotEmpty, Service } from '@stone-js/core'

/**
 * Team Service Options
*/
export interface TeamServiceOptions {
  teamClient: TeamClient
  mediaService: MediaService
}

/**
 * Team Service
*/
@Service({ alias: 'teamService' })
export class TeamService {
  private readonly client: TeamClient
  private readonly mediaService: MediaService

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
  constructor ({ teamClient, mediaService }: TeamServiceOptions) {
    this.client = teamClient
    this.mediaService = mediaService
  }

  /**
   * List all posts
   */
  async list (limit?: number, page?: string | number): Promise<Team[]> {
    return await this.client.list(limit, page)
  }

  /**
   * Find a team
   *
   * @param conditions - The conditions to find the team
   * @returns The found team
   */
  async getByName (name: string): Promise<Team> {
    return await this.client.getByName(name)
  }

  /**
   * Results of the team
   *
   * @returns The results of the team
   */
  async results (): Promise<TeamStat[]> {
    return await this.client.results()
  }

  /**
   * Current team
   *
   * @returns The current team
   */
  async currentTeam (): Promise<Team> {
    return await this.client.currentTeam()
  }

  /**
   * Create a new team
   */
  async create (data: Partial<Team>, logoFile?: File, bannerFile?: File): Promise<{ uuid?: string }> {
    const logoUrl = await this.uploadFile('team-logos', logoFile)
    const bannerUrl = await this.uploadFile('team-banners', bannerFile)
    return await this.client.create({ ...data, logoUrl, bannerUrl })
  }

  /**
   * Update an existing team
   */
  async update (uuid: string, data: Partial<Team>, logoFile?: File, bannerFile?: File): Promise<Team> {
    const logoUrl = await this.uploadFile('team-logos', logoFile)
    const bannerUrl = await this.uploadFile('team-banners', bannerFile)
    return await this.client.update(uuid, { ...data, logoUrl, bannerUrl })
  }

  /**
   * Delete a team
   */
  async delete (uuid: string): Promise<void> {
    return await this.client.delete(uuid)
  }

  /**
   * Upload a file to the media service
   * 
   * @param group - The group to upload the file to
   * @param file - The file to upload
   * @returns The URL of the uploaded file
   */
  private async uploadFile(group: string, file?: File): Promise<string | undefined> {
    return isNotEmpty<File>(file) ? await this.mediaService.uploadFile(file, group) : undefined
  }
}
