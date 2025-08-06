import { Spin } from '../models/Spin'
import { Event } from '@stone-js/core'

/**
 * Spin Event
 */
export class SpinEvent extends Event {
  /**
   * SPIN Event name, fired when a spin occurs.
   *
   * @event SpinEvent#SPIN
   */
  static readonly SPIN: string = 'spin.spin'

  /**
   * Create a new SpinEvent
   *
   * @param spin - The spin that occurred
   */
  constructor (public readonly spin: Spin) {
    super({ type: SpinEvent.SPIN })
  }
}
