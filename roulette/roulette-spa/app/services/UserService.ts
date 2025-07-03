import { User } from '../models/User'
import { isEmpty, Service } from '@stone-js/core'
import { UserClient } from '../clients/UserClient'

/**
 * User Service Options
*/
export interface UserServiceOptions {
  userClient: UserClient
}

/**
 * User Service
 *
 * @Service() decorator is used to define a new service
 * @Service() is an alias of @Stone() decorator.
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
*/
@Service({ alias: 'userService' })
export class UserService {
  private _currentUser?: User
  private readonly userClient: UserClient

  /**
   * Create a new User Service
  */
  constructor ({ userClient }: UserServiceOptions) {
    this.userClient = userClient
  }

  /**
   * Get the current user
   */
  async current (singleton?: boolean): Promise<User> {
    if (isEmpty(this._currentUser) || singleton !== true) {
      this._currentUser = await this.userClient.currentUser()
    }

    return this._currentUser
  }
}
