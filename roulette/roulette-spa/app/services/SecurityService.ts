import { Service } from '@stone-js/core'
import { TokenService } from './TokenService'
import { SecurityClient } from '../clients/SecurityClient'
import { UserActivation, UserChangePassword, UserLogin } from '../models/User'

/**
 * Security Service Options
*/
export interface SecurityServiceOptions {
  tokenService: TokenService
  securityClient: SecurityClient
}

/**
 * Security Service
 *
 * @Service() decorator is used to define a new service
 * @Service() is an alias of @Stone() decorator.
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
*/
@Service({ alias: 'securityService' })
export class SecurityService {
  private readonly tokenService: TokenService
  private readonly securityClient: SecurityClient

  /**
   * Create a new Security Service
  */
  constructor ({ tokenService, securityClient }: SecurityServiceOptions) {
    this.tokenService = tokenService
    this.securityClient = securityClient
  }

  /**
   * Activate a user by sending an OTP to their phone number
   *
   * @param phone - The phone number to activate
   * @return The user activation details
  */
  async activate (phone: string): Promise<UserActivation> {
    return await this.securityClient.activate(phone)
  }

  /**
   * Login a user
   *
   * @param user - The user to login
   * @returns The user token
  */
  async login (user: UserLogin): Promise<void> {
    const token = await this.securityClient.login(user)
    this.tokenService.saveToken(token)
  }

  /**
   * Change the password of a user
   *
   * @param user - The user to change the password
  */
  async changePassword (user: UserChangePassword): Promise<void> {
    await this.securityClient.changePassword(user)
  }

  /**
   * Logout a user
  */
  async logout (): Promise<void> {
    await this.securityClient.logout()
    this.tokenService.removeToken()
  }

  /**
   * Check if the user is authenticated
   *
   * @returns True if the user is authenticated, false otherwise
   */
  isAuthenticated (): boolean {
    return this.tokenService.isAuthenticated()
  }
}
