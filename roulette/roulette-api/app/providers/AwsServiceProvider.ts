import {
  Provider,
  IContainer,
  IBlueprint,
  IServiceProvider
} from '@stone-js/core'
import { SNSClient } from '@aws-sdk/client-sns'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { DynamoBetRepository } from '../repositories/dynamobd/DynamoBetRepository'
import { DynamoUserRepository } from '../repositories/dynamobd/DynamoUserRepository'
import { DynamoTeamRepository } from '../repositories/dynamobd/DynamoTeamRepository'
import { AWS_LAMBDA_HTTP_PLATFORM } from '@stone-js/aws-lambda-http-adapter'
import { DynamoSessionRepository } from '../repositories/dynamobd/DynamoSessionRepository'

/**
 * AWS Service Provider
 */
@Provider()
export class AwsServiceProvider implements IServiceProvider {
  /**
   * Create a new instance of AwsServiceProvider
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
   * Check if the provider should be skipped
   *
   * @returns true if the provider should be skipped, false otherwise
   */
  mustSkip (): boolean {
    return !this.blueprint.is('stone.adapter.platform', AWS_LAMBDA_HTTP_PLATFORM)
  }

  /**
   * Register services to the container
   */
  register (): void {
    this.registerDynamoClient()
    this.registerAwsSnsClient()
    this.registerRepositories()
  }

  /**
   * Register the DynamoDB client
   */
  registerDynamoClient (): void {
    const docClient = DynamoDBDocumentClient.from(
      new DynamoDBClient(this.blueprint.get('aws.dynamo', { region: 'us-east-1' }))
    )

    this.container
      .instanceIf('dynamoClient', docClient)
      .alias('dynamoClient', ['awsDynamoClient', 'database', 'db'])
  }

  /**
   * Register the AWS SNS client
   */
  registerAwsSnsClient (): void {
    const snsClient = new SNSClient(this.blueprint.get('aws.sns', { region: 'us-east-1' }))
    this.container
      .instanceIf('snsClient', snsClient)
      .alias('snsClient', ['awsSnsClient', 'notificationClient'])
  }

  /**
   * Register repositories to the container
   */
  registerRepositories (): void {
    this.container
      .autoBinding(DynamoBetRepository, DynamoBetRepository, true, ['betRepository'])
      .autoBinding(DynamoUserRepository, DynamoUserRepository, true, ['userRepository'])
      .autoBinding(DynamoTeamRepository, DynamoTeamRepository, true, ['teamRepository'])
      .autoBinding(DynamoSessionRepository, DynamoSessionRepository, true, ['sessionRepository'])
  }
}
