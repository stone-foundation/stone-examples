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
*/
@Service({ alias: 'securityService' })
export class SecurityService {
  private readonly client: SecurityClient
  private readonly tokenService: TokenService

  /**
   * Create a new Security Service
  */
  constructor ({ tokenService, securityClient }: SecurityServiceOptions) {
    this.client = securityClient
    this.tokenService = tokenService
  }

  /**
   * Activate a user by sending an OTP to their phone number
   *
   * @param phone - The phone number to activate
   * @return The user activation details
  */
  async activate (phone: string): Promise<UserActivation> {
    return await this.client.activate(phone)
  }

  /**
   * Login a user
   *
   * @param user - The user to login
   * @returns The user token
  */
  async login (user: UserLogin): Promise<void> {
    const token = await this.client.login(user)
    this.tokenService.saveToken(token)
  }

  /**
   * Change the password of a user
   *
   * @param user - The user to change the password
  */
  async changePassword (user: UserChangePassword): Promise<void> {
    await this.client.changePassword(user)
  }

  /**
   * Logout a user
  */
  async logout (): Promise<void> {
    await this.client.logout()
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
