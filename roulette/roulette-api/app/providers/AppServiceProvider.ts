import {
  Provider,
  IContainer,
  IBlueprint,
  IServiceProvider
} from '@stone-js/core'
import twilio from 'twilio'
import { TwilioConfig } from '../models/App'

/**
 * App Service Provider
 */
@Provider()
export class AppServiceProvider implements IServiceProvider {
  /**
   * Create a new instance of AppServiceProvider
   *
   * @param options
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Get the blueprint instance
   */
  get blueprint (): IBlueprint {
    return this.container.make<IBlueprint>('blueprint')
  }

  /**
   * Register services to the container
   */
  register (): void {
    this.registerTwilioClient()
  }

  /**
   * Register the Twilio client
   */
  registerTwilioClient (): void {
    if (this.blueprint.is('twilio.enabled', true)) {
      const config = this.blueprint.get<TwilioConfig>('twilio', {} as unknown as TwilioConfig)
      this.container.instance('twilioClient', twilio(config.accountSid, config.authToken))
    }
  }
}
