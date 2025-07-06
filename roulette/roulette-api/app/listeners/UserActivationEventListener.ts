import { Twilio } from 'twilio'
import { UserActivation } from '../models/User'
import { UserActivationEvent } from '../events/UserActivationEvent'
import { IBlueprint, IContainer, IEventListener, Listener, Logger } from '@stone-js/core'

/**
 * UserActivationEvent Listener Options
*/
export interface UserActivationEventListenerOptions {
  container: IContainer
  blueprint: IBlueprint
}

/**
 * UserActivationEvent listener
 */
@Listener({ event: UserActivationEvent.USER_REQUEST_ACTIVATION })
export class UserActivationEventListener implements IEventListener<UserActivationEvent> {
  private readonly container: IContainer
  private readonly blueprint: IBlueprint

  /**
   * Create a new instance of UserEventSubscriber
   */
  constructor ({ blueprint, container }: UserActivationEventListenerOptions) {
    this.container = container
    this.blueprint = blueprint
  }

  /**
   * Handle the UserActivationEvent
   *
   * @param event - The event to handle
   */
  async handle (event: UserActivationEvent): Promise<void> {
    // Only send SMS when Twilio is enabled
    if (this.blueprint.is('twilio.enabled', true)) {
      await this.sendOtpSms(event.user)
    }
  }

  /**
   * Send OTP SMS via Twilio
   *
   * @param user - The user activation data
   * @returns The message ID of the sent SMS
   */
  async sendOtpSms (user: UserActivation): Promise<string | undefined> {
    const fromPhone = this.blueprint.get('twilio.from', '')
    const twilioClient = this.container.make<Twilio>('twilioClient')
    const toPhone = this.blueprint.get<string>('twilio.tmpRecipient') ?? user.phone
    const message = this.blueprint.get(
      'app.security.otp.message',
      'Votre code de verification est: {otp}'
    ).replace('{otp}', user.otp)

    const response = await twilioClient.messages.create({ body: message, to: toPhone, from: fromPhone })

    Logger.info('SMS sent, MessageId:', response)

    return response.sid
  }
}
