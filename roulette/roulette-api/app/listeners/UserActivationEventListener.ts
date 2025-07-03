import { UserActivation } from '../models/User'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { UserActivationEvent } from '../events/UserActivationEvent'
import { AWS_LAMBDA_HTTP_PLATFORM } from '@stone-js/aws-lambda-http-adapter'
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
    // Only send SMS if the platform is AWS Lambda HTTP
    if (this.blueprint.is('stone.adapter.platform', AWS_LAMBDA_HTTP_PLATFORM)) {
      await this.sendOtpSmsViaSNS(event.user)
    }
  }

  /**
   * Send OTP SMS via SNS
   *
   * @param user - The user activation data
   * @returns The message ID of the sent SMS
   */
  async sendOtpSmsViaSNS (user: UserActivation): Promise<string | undefined> {
    const message = this.blueprint.get('app.security.otp.message', 'Votre code de verification est: {otp}').replace('{otp}', user.otp)

    const cmd = new PublishCommand({
      Message: message,
      PhoneNumber: user.phone,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    })

    const response = await this.container.make<SNSClient>('notificationClient').send(cmd)

    Logger.info('SMS sent, MessageId:', response.MessageId)

    return response.MessageId
  }
}
