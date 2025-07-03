import { getBoolean, getNumber, getString } from '@stone-js/env'
import { CORSHeadersMiddleware } from '@stone-js/http-core'
import { Configuration, defineBlueprintMiddleware, IBlueprint, IConfiguration, Promiseable } from '@stone-js/core'

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
    blueprint
      .set('app', this.appConfig())
      .set('stone.http.cors.preflightStop', true)
      .set('stone.http.cors.allowedHeaders', ['*'])
      .set(defineBlueprintMiddleware(CORSHeadersMiddleware))
  }

  /**
   * Get the application configuration
   */
  private appConfig (): Record<string, any> {
    return {
      security: this.securityConfig(),
      bet: {
        limit: getNumber('BET_LIMIT', 100)
      },
      team: {
        defaultMaxTeam: getNumber('TEAM_DEFAULT_MAX_TEAM', 10),
        defaultTotalMember: getNumber('TEAM_DEFAULT_TOTAL_MEMBER', 10)
      }
    }
  }

  /**
   * Get the security configuration
   */
  private securityConfig (): Record<string, any> {
    return {
      jwt: {
        expiresIn: 3600
      },
      bcrypt: {
        saltRounds: 10
      },
      admins: [
        {
          role: 'admin',
          phone: getString('ADMIN_PHONE_NUMBER')
        }
      ],
      admin: {
        roles: 'admin',
        username: getString('ADMIN_USERNAME'),
        phone: getString('ADMIN_PHONE_NUMBER'),
        fullname: getString('ADMIN_FULL_NAME'),
        password: getString('ADMIN_TMP_PASSWORD')
      },
      allowRegister: getBoolean('SECURITY_ALLOW_REGISTER', false),
      secret: getString('SECURITY_JWT_SECRET', 'non_prod_secret')
    }
  }
}
