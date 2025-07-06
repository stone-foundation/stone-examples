import { getString } from '@stone-js/env'
import { Configuration, IBlueprint, IConfiguration, Promiseable } from '@stone-js/core'

/**
 * User Implicit Configuration
 */
@Configuration()
export class AppConfiguration implements IConfiguration {
  /**
   * Configure the application
   *
   * @param blueprint - The blueprint to configure
   */
  configure (blueprint: IBlueprint): Promiseable<void> {
    blueprint.set('app', this.appConfig())
  }

  /**
   * Get the application configuration
   */
  private appConfig (): Record<string, any> {
    return {
      website: {
        url: getString('APP_WEBSITE_URL', '')
      },
      roulette: {
        spinningTime: getString('APP_ROULETTE_SPINNING_TIME', '10000')
      },
      clients: {
        baseURL: getString('API_BASE_URL', 'http://localhost:8080'),
        user: {
          path: getString('API_CLIENT_USER_PATH', '/users')
        },
        team: {
          path: getString('API_CLIENT_TEAM_PATH', '/teams')
        },
        security: {
          path: getString('API_CLIENT_SECURITY_PATH', '')
        },
        roulette: {
          path: getString('API_CLIENT_ROULETTE_PATH', '/roulette')
        }
      }
    }
  }
}
