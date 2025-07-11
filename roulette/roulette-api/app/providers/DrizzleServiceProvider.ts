import {
  Hook,
  Provider,
  IContainer,
  IBlueprint,
  IServiceProvider,
  AdapterHookListenerContext
} from '@stone-js/core'
import { Config } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { DatabaseClient } from '../database/DatabaseClient'
import { BetRepository } from '../repositories/drizzle/BetRepository'
import { TeamRepository } from '../repositories/drizzle/TeamRepository'
import { PostRepository } from '../repositories/drizzle/PostRepository'
import { UserRepository } from '../repositories/drizzle/UserRepository'
import { BadgeRepository } from '../repositories/drizzle/BadgeRepository'
import { AWS_LAMBDA_HTTP_PLATFORM } from '@stone-js/aws-lambda-http-adapter'
import { SessionRepository } from '../repositories/drizzle/SessionRepository'
import { MetadataRepository } from '../repositories/drizzle/MetadataRepository'
import { ActivityRepository } from '../repositories/drizzle/ActivityRepository'
import { PostCommentRepository } from '../repositories/drizzle/PostCommentRepository'
import { BadgeAssignmentRepository } from '../repositories/drizzle/BadgeAssignmentRepository'
import { ActivityAssignmentRepository } from '../repositories/drizzle/ActivityAssignmentRepository'

/**
 * Drizzle Service Provider
 *
 * In this example, we are using both ServiceProvider to bind the drizzle instance to the container
 * And AdapterHook to start and stop the drizzle client
 */
@Provider()
export class DrizzleServiceProvider implements IServiceProvider {
  /**
   * Create a new instance of DrizzleServiceProvider
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
    return this.blueprint.is('stone.adapter.platform', AWS_LAMBDA_HTTP_PLATFORM)
  }

  /**
   * On start hook that will be called
   * once when the application starts
   *
   * @param context - The adapter hook listener context
   */
  @Hook('onStart')
  onStart ({ blueprint }: AdapterHookListenerContext): void {
    DatabaseClient.create(
      blueprint.get<Config>('database', { url: 'file:local.db' })
    )
  }

  /**
   * Register services to the container
   */
  register (): void {
    this.registerDrizzleClient()
    this.registerRepositories()
  }

  /**
   * Register the drizzle client
   */
  registerDrizzleClient (): void {
    this.container
      .instanceIf('drizzle', drizzle(DatabaseClient.client))
      .alias('drizzle', ['database', 'db'])
  }

  /**
   * Register repositories to the container
   */
  registerRepositories (): void {
    this.container
      .autoBinding(BetRepository, BetRepository, true, ['betRepository'])
      .autoBinding(UserRepository, UserRepository, true, ['userRepository'])
      .autoBinding(TeamRepository, TeamRepository, true, ['teamRepository'])
      .autoBinding(PostRepository, PostRepository, true, ['postRepository'])
      .autoBinding(BadgeRepository, BadgeRepository, true, ['badgeRepository'])
      .autoBinding(SessionRepository, SessionRepository, true, ['sessionRepository'])
      .autoBinding(MetadataRepository, MetadataRepository, true, ['metadataRepository'])
      .autoBinding(ActivityRepository, ActivityRepository, true, ['activityRepository'])
      .autoBinding(PostCommentRepository, PostCommentRepository, true, ['postCommentRepository'])
      .autoBinding(BadgeAssignmentRepository, BadgeAssignmentRepository, true, ['badgeAssignmentRepository'])
      .autoBinding(ActivityAssignmentRepository, ActivityAssignmentRepository, true, ['activityAssignmentRepository'])
  }

  /**
   * On stop hook that will be called
   * once when the application stops
   *
   * @param context - The adapter hook listener context
   */
  @Hook('onStop')
  onStop (): void {
    DatabaseClient.close()
  }
}
