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
 *
 * @Service() decorator is used to define a new service
 * @Service() is an alias of @Stone() decorator.
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
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
