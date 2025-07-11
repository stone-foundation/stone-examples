import { getString } from '@stone-js/env'
import { Configuration, IBlueprint, IConfiguration, Promiseable } from '@stone-js/core'

/**
 * User Implicit Configuration
 */
@Configuration()
export class AwsConfiguration implements IConfiguration {
  /**
   * Configure the application
   *
   * @param blueprint - The blueprint to configure
   */
  configure (blueprint: IBlueprint): Promiseable<void> {
    blueprint.set('aws', {
      region: getString('AWS_REGION', 'us-east-1'),
      dynamo: {
        region: getString('AWS_REGION', 'us-east-1'),
        tables: {
          bets: {
            name: getString('AWS_DYNAMO_TABLE_BETS', 'roulette-bets')
          },
          users: {
            name: getString('AWS_DYNAMO_TABLE_USERS', 'roulette-users')
          },
          teams: {
            name: getString('AWS_DYNAMO_TABLE_TEAMS', 'roulette-teams')
          },
          sessions: {
            name: getString('AWS_DYNAMO_TABLE_SESSIONS', 'roulette-sessions')
          },
          badges: {
            name: getString('AWS_DYNAMO_TABLE_BADGES', 'roulette-badges')
          },
          badgesAssignments: {
            name: getString('AWS_DYNAMO_TABLE_BADGE_ASSIGNMENTS', 'roulette-badges-assignments')
          },
          metadata: {
            name: getString('AWS_DYNAMO_TABLE_METADATA', 'roulette-tables-metadata')
          }
        }
      }
    })
  }
}
