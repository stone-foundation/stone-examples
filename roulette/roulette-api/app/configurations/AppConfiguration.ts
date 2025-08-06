import { CORSHeadersMiddleware } from '@stone-js/http-core'
import { getBoolean, getNumber, getString } from '@stone-js/env'
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
      .set('twilio', this.twilioConfig())
      .set('app.security', this.securityConfig())
      .set('stone.http.cors.preflightStop', true)
      .set('stone.http.cors.allowedHeaders', ['*'])
      .set(defineBlueprintMiddleware(CORSHeadersMiddleware))
      .set('openai.apiKey', getString('OPENAI_API_KEY', { optional: true }))
  }

  /**
   * Get the application configuration
   */
  private appConfig (): Record<string, any> {
    return {
      bet: {
        limit: getNumber('BET_LIMIT', 100)
      },
      team: {
        defaultMaxTeams: getNumber('TEAM_DEFAULT_MAX_TEAMS', 10),
        defaultTotalMembers: getNumber('TEAM_DEFAULT_TOTAL_MEMBERS', 10)
      }
    }
  }

  /**
   * Get the Twilio configuration
   */
  private twilioConfig (): Record<string, any> {
    return {
      from: getString('TWILIO_PHONE_NUMBER', ''),
      enabled: getBoolean('TWILIO_ENABLED', false),
      authToken: getString('TWILIO_AUTH_TOKEN', ''),
      accountSid: getString('TWILIO_ACCOUNT_SID', ''),
      tmpRecipient: getString('TWILIO_TMP_RECIPIENT', { optional: true }) // TODO: To check Env lib returns null instead of undefined
    }
  }

  /**
   * Get the security configuration
   */
  private securityConfig (): Record<string, any> {
    return {
      bcrypt: {
        saltRounds: 10
      },
      jwt: {
        expiresIn: 3600
      },
      admin: {
        roles: 'admin',
        username: getString('ADMIN_USERNAME'),
        phone: getString('ADMIN_PHONE_NUMBER'),
        fullname: getString('ADMIN_FULL_NAME'),
        password: getString('ADMIN_TMP_PASSWORD')
      },
      admins: [
        {
          role: 'admin',
          phone: getString('ADMIN_PHONE_NUMBER')
        }
      ],
      allowRegister: getBoolean('SECURITY_ALLOW_REGISTER', false),
      secret: getString('SECURITY_JWT_SECRET', 'non_prod_secret'),
      otp: {
        maxCount: getNumber('OTP_MAX_COUNT', 5),
        expiresIn: getNumber('OTP_EXPIRES_IN', 300000),
        message: getString('OTP_MESSAGE', 'Votre code de verification est: {otp}')
      }
    }
  }
}
