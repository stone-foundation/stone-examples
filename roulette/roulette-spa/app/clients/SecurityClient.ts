import { Axios } from 'axios'
import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'
import { UserRegistration, UserActivation, UserChangePassword, UserLogin, UserToken } from '../models/User'

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
   * Verify user activation by sending an OTP to their phone number
   *
   * @param phone - The phone number to activate
   * @return The user activation details
   */
  async verifyActivation (phone: string): Promise<UserActivation> {
    return (await this.axios.post<UserActivation>(`${this.path}/verify-activation`, { phone }, { headers: this.getHeaders() })).data
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
   * Register a new user
   * 
   * @param payload - The payload containing phone, mission, username, fullname, password, and confirmPassword.
   * @return The user activation details
   */
  async register (payload: UserRegistration): Promise<void> {
    await this.axios.post(`${this.path}/register`, payload, { headers: this.getHeaders() })
  }

  /**
   * Request change password
   * 
   * @param phone - The phone number to request change password
   */
  async requestChangePassword (phone: string): Promise<void> {
    await this.axios.post(`${this.path}/request-change-password`, { phone }, { headers: this.getHeaders() })
  }

  /**
   * Change the password of a user
   *
   * @param user - The user to change the password for
   */
  async changePassword (password: UserChangePassword): Promise<void> {
    await this.client.post(`${this.path}/change-password`, password)
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
