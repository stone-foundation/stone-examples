
import { Axios } from 'axios'
import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'
import { UserActivation, UserChangePassword, UserLogin, UserToken } from '../models/User'

/**
 * Security Client Options
*/
export interface SecurityClientOptions {
  axios: Axios
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Security Client
 */
@Stone({ alias: 'securityClient' })
export class SecurityClient {
  private readonly path: string
  private readonly axios: Axios
  private readonly client: AxiosClient

  /**
   * Create a new Security Client
   *
   * @param options - The options to create the Security Client.
   */
  constructor ({ blueprint, axios, httpClient }: SecurityClientOptions) {
    this.axios = axios
    this.client = httpClient
    this.path = blueprint.get('app.clients.security.path', '')
  }

  /**
   * Activate a user by sending an OTP to their phone number
   *
   * @param phone - The phone number to activate
   * @return The user activation details
   */
  async activate (phone: string): Promise<UserActivation> {
    return (await this.axios.post<UserActivation>(`${this.path}/activate`, { phone }, { headers: this.getHeaders() })).data
  }

  /**
   * Login a user
   *
   * @param user - The user to login
   * @return The user token
   */
  async login (user: UserLogin): Promise<UserToken> {
    return (await this.axios.post<UserToken>(`${this.path}/login`, user, { headers: this.getHeaders() })).data
  }

  /**
   * Change the password of a user
   *
   * @param user - The user to change the password for
   */
  async changePassword (user: UserChangePassword): Promise<void> {
    await this.client.post(`${this.path}/change-password`, user)
  }

  /**
   * Logout a user
   */
  async logout (): Promise<void> {
    await this.client.post(`${this.path}/logout`)
  }

  /**
   * Get the headers for the request
   *
   * @returns The headers object
   */
  private getHeaders (): Record<string, string> {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }
}
