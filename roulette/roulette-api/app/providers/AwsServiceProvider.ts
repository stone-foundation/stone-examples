import {
  Provider,
  IContainer,
  IBlueprint,
  IServiceProvider
} from '@stone-js/core'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { AWS_LAMBDA_HTTP_PLATFORM } from '@stone-js/aws-lambda-http-adapter'
import { DynamoUserRepository } from '../repositories/dynamobd/DynamoUserRepository'
import { DynamoTeamRepository } from '../repositories/dynamobd/DynamoTeamRepository'
import { DynamoSpinRepository } from '../repositories/dynamobd/DynamoSpinRepository'
import { DynamoPostRepository } from '../repositories/dynamobd/DynamoPostRepository'
import { DynamoBadgeRepository } from '../repositories/dynamobd/DynamoBadgeRepository'
import { DynamoMissionRepository } from '../repositories/dynamobd/DynamoMissionRepository'
import { DynamoSessionRepository } from '../repositories/dynamobd/DynamoSessionRepository'
import { DynamoMetadataRepository } from '../repositories/dynamobd/DynamoMetadataRepository'
import { DynamoActivityRepository } from '../repositories/dynamobd/DynamoActivityRepository'
import { DynamoTeamMemberRepository } from '../repositories/dynamobd/DynamoTeamMemberRepository'
import { DynamoChatMessageRepository } from '../repositories/dynamobd/DynamoChatMessageRepository'
import { DynamoUserHistoryRepository } from '../repositories/dynamobd/DynamoUserHistoryRepository'
import { DynamoPostCommentRepository } from '../repositories/dynamobd/DynamoPostCommentRepository'
import { DynamoBadgeAssignmentRepository } from '../repositories/dynamobd/DynamoBadgeAssignmentRepository'
import { DynamoActivityAssignmentRepository } from '../repositories/dynamobd/DynamoActivityAssignmentRepository'

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
   * Register repositories to the container
   */
  registerRepositories (): void {
    this.container
      .autoBinding(DynamoSpinRepository, DynamoSpinRepository, true, ['spinRepository'])
      .autoBinding(DynamoUserRepository, DynamoUserRepository, true, ['userRepository'])
      .autoBinding(DynamoTeamRepository, DynamoTeamRepository, true, ['teamRepository'])
      .autoBinding(DynamoPostRepository, DynamoPostRepository, true, ['postRepository'])
      .autoBinding(DynamoBadgeRepository, DynamoBadgeRepository, true, ['badgeRepository'])
      .autoBinding(DynamoMissionRepository, DynamoMissionRepository, true, ['missionRepository'])
      .autoBinding(DynamoSessionRepository, DynamoSessionRepository, true, ['sessionRepository'])
      .autoBinding(DynamoMetadataRepository, DynamoMetadataRepository, true, ['metadataRepository'])
      .autoBinding(DynamoActivityRepository, DynamoActivityRepository, true, ['activityRepository'])
      .autoBinding(DynamoTeamMemberRepository, DynamoTeamMemberRepository, true, ['teamMemberRepository'])
      .autoBinding(DynamoUserHistoryRepository, DynamoUserHistoryRepository, true, ['userHistoryRepository'])
      .autoBinding(DynamoChatMessageRepository, DynamoChatMessageRepository, true, ['chatMessageRepository'])
      .autoBinding(DynamoPostCommentRepository, DynamoPostCommentRepository, true, ['postCommentRepository'])
      .autoBinding(DynamoBadgeAssignmentRepository, DynamoBadgeAssignmentRepository, true, ['badgeAssignmentRepository'])
      .autoBinding(DynamoActivityAssignmentRepository, DynamoActivityAssignmentRepository, true, ['activityAssignmentRepository'])
  }
}
