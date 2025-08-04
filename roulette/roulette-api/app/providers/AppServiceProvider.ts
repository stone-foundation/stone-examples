import {
  Provider,
  IContainer,
  IBlueprint,
  IServiceProvider
} from '@stone-js/core'
import twilio from 'twilio'
import OpenAI from 'openai'
import { TwilioConfig } from '../models/App'
import { S3Client } from '@aws-sdk/client-s3'

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
    this.registerS3Client()
    this.registerTwilioClient()
    this.registerOpenAIClient()
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

  /**
   * Register the S3 client
   */
  registerS3Client (): void {
    const region = this.blueprint.get('aws.region', 'us-east-2')
    this.container.instance('s3Client', new S3Client({ region }))
  }

  /**
   * Register the OpenAI client
   */
  registerOpenAIClient (): void {
    const apiKey = this.blueprint.get('openai.apiKey', '')
    this.container.instance('openaiClient', new OpenAI({ apiKey }))
  }
}
