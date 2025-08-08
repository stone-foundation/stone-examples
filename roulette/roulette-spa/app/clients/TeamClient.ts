import { Team } from '../models/Team'
import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'

/**
 * Team Client Options
 */
export interface TeamClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Team Client
 */
@Stone({ alias: 'teamClient' })
export class TeamClient {
  private readonly path: string
  private readonly client: AxiosClient

  /**
   * Create a new Team Client
   *
   * @param options - The options to create the Team Client.
   */
  constructor ({ blueprint, httpClient }: TeamClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.team.path', '/teams')
  }
  
  /**
   * List all posts
   */
  async list (options: Partial<Team> = {}, limit: number = 10, page?: string | number): Promise<ListMetadataOptions<Team>> {
    const query = new URLSearchParams({
      limit: String(limit),
      ...(page && { page: String(page) }),
      ...(options.missionUuid && { missionUuid: options.missionUuid })
    })
    
    return await this.client.get<ListMetadataOptions<Team>>(`${this.path}/?${query.toString()}`)
  }

  /**
   * Get a badge by name
   */
  async getByName (name: string): Promise<Team> {
    return await this.client.get<Team>(`${this.path}/by-name/${name}`)
  }

  /**
   * Get the current team
   *
   * @returns The current team
   */
  async getMyTeam (): Promise<Team> {
    return await this.client.get<Team>(`${this.path}/me`)
  }

  /**
   * Create a new team
   */
  async create (data: Partial<Team>): Promise<{ uuid?: string }> {
    return await this.client.post<{ uuid?: string }>(`${this.path}`, data)
  }

  /**
   * Update an existing team
   */
  async update (uuid: string, data: Partial<Team>): Promise<Team> {
    return await this.client.patch<Team>(`${this.path}/${uuid}`, data)
  }

  /**
   * Delete a team
   */
  async delete (uuid: string): Promise<void> {
    await this.client.delete(`${this.path}/${uuid}`)
  }
}
