import { Event } from '@stone-js/core'
import { UserActivation } from '../models/User'

/**
 * UserActivation Event
 */
export class UserActivationEvent extends Event {
  /**
   * USER_REQUEST_ACTIVATION Event name, fired when a user requests activation.
   *
   * @event UserActivationEvent#USER_REQUEST_ACTIVATION
   */
  static readonly USER_REQUEST_ACTIVATION: string = 'user.requestActivation'

  /**
   * Create a new UserActivationEvent
   *
   * @param user - The user requesting activation
   */
  constructor (public readonly user: UserActivation) {
    super({ type: UserActivationEvent.USER_REQUEST_ACTIVATION })
  }
}
