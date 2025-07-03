import { isEmpty } from '@stone-js/core'
import { EventHandler, Post } from '@stone-js/router'
import { SecurityService } from '../services/SecurityService'
import { BadRequestError, IncomingHttpEvent, NoContentHttpResponse } from '@stone-js/http-core'
import { User, UserActivation, UserActivationRequest, UserChangePassword, UserCredentials, UserRegister, UserToken } from '../models/User'

/**
 * Security Event Handler Options
*/
export interface SecurityEventHandlerOptions {
  securityService: SecurityService
}

/**
 * Security Event Handler
*/
@EventHandler('/', { name: 'security' })
export class SecurityEventHandler {
  private readonly securityService: SecurityService

  /**
   * Create a new instance of SecurityEventHandler
   *
   * @param securityService
   */
  constructor ({ securityService }: SecurityEventHandlerOptions) {
    this.securityService = securityService
  }

  /**
   * Make a user an admin
   *
   * @param event - IncomingHttpEvent
  */
  @Post('/make-admin')
  @NoContentHttpResponse({ 'content-type': 'application/json' })
  async makeAdmin (_event: IncomingHttpEvent): Promise<void> {
    await this.securityService.createAdminUser()
  }

  /**
   * Request user activation
   *
   * @param event - IncomingHttpEvent
   * @returns UserActivation
  */
  @Post('/activate', { name: 'activate' })
  async activate (event: IncomingHttpEvent): Promise<Partial<UserActivation>> {
    return await this.securityService.requestActivation(
      event.getBody<UserActivationRequest>({ phone: '' })
    )
  }

  /**
   * Login a user
   *
   * @param event - IncomingHttpEvent
   * @returns UserToken
  */
  @Post('/login', { name: 'login' })
  async login (event: IncomingHttpEvent): Promise<UserToken> {
    return await this.securityService.login(
      event,
      event.getBody<UserCredentials>({ phone: '' })
    )
  }

  /**
   * Logout a user
   *
   * @param event - IncomingHttpEvent
   * @returns void
  */
  @Post('/logout', { name: 'logout', middleware: ['auth'] })
  @NoContentHttpResponse({ 'content-type': 'application/json' })
  async logout (event: IncomingHttpEvent): Promise<void> {
    await this.securityService.logout(
      event.get<string>('Authorization', '').replace('Bearer ', '')
    )
  }

  /**
   * Refresh a token
   *
   * @param event - IncomingHttpEvent
   * @returns UserToken
  */
  @Post('/refresh', { name: 'refresh' })
  async refresh (event: IncomingHttpEvent): Promise<UserToken> {
    return await this.securityService.refresh(
      event.get<string>('Authorization', '').replace('Bearer ', '')
    )
  }

  /**
   * Register a user
   *
   * @param event - IncomingHttpEvent
   * @returns UserToken
  */
  @Post('/register', { name: 'register' })
  @NoContentHttpResponse({ 'content-type': 'application/json' })
  async register (event: IncomingHttpEvent): Promise<void> {
    await this.securityService.register(
      event.getBody<UserRegister>({} as any)
    )
  }

  /**
   * Change password
   *
   * @param event - IncomingHttpEvent
   * @returns void
  */
  @Post(['/set-password', '/change-password'], { name: 'change-password', middleware: ['auth'] })
  @NoContentHttpResponse({ 'content-type': 'application/json' })
  async changePassword (event: IncomingHttpEvent): Promise<void> {
    const user = event.getUser<User>()
    const data = event.getBody<UserChangePassword>()

    this.validatePasswordData(data)

    if (isEmpty(data) || isEmpty(user)) {
      throw new BadRequestError('User data is required')
    }

    await this.securityService.changePassword(user, data)
  }

  /**
   * Validate password data
   *
   * @param data - UserChangePassword data to validate
   * @throws BadRequestError if validation fails
  */
  private validatePasswordData (data?: UserChangePassword): void {
    if (isEmpty(data) || data.newPassword?.length < 6) {
      throw new BadRequestError('Invalid password')
    }
  }
}
