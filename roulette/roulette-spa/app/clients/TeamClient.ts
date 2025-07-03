import { AxiosClient } from './AxiosClient'
import { Team, TeamStat } from '../models/Team'
import { IBlueprint, Stone } from '@stone-js/core'

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
   * Get the team stats
   *
   * @returns The team stats
   */
  async stats (): Promise<TeamStat[]> {
    return await this.client.get<TeamStat[]>(`${this.path}/stats`)
  }

  /**
   * Get the current team
   *
   * @returns The current team
   */
  async currentTeam (): Promise<Team> {
    return await this.client.get<Team>(`${this.path}/me`)
  }
}
