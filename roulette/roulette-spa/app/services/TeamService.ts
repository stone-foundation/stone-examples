import { Service } from '@stone-js/core'
import { Team, TeamStat } from '../models/Team'
import { TeamClient } from '../clients/TeamClient'

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
   * Create a new Team Service
  */
  constructor ({ teamClient }: TeamServiceOptions) {
    this.teamClient = teamClient
  }

  /**
   * Stats of the team
   *
   * @returns The stats of the team
   */
  async stats (): Promise<TeamStat[]> {
    return await this.teamClient.stats()
  }

  /**
   * Current team
   *
   * @returns The current team
   */
  async currentTeam (): Promise<Team> {
    return await this.teamClient.currentTeam()
  }
}
