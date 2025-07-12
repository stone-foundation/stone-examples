import { getString } from '@stone-js/env'
import { Configuration, IBlueprint, IConfiguration, Promiseable } from '@stone-js/core'

/**
 * User Implicit Configuration
 */
@Configuration()
export class AwsConfiguration implements IConfiguration {
  /**
   * Configure the application
   *
   * @param blueprint - The blueprint to configure
   */
  configure (blueprint: IBlueprint): Promiseable<void> {
    blueprint.set('aws', {
      region: getString('AWS_REGION', 'us-east-1'),
      s3: {
        bucketName: getString('AWS_S3_BUCKET_NAME', 'teams'),
        postsFolderName: getString('AWS_S3_BUCKET_UPLOAD_POSTS_FOLDER', 'posts'),
        usersFolderName: getString('AWS_S3_BUCKET_UPLOAD_USERS_FOLDER', 'users'),
        teamsFolderName: getString('AWS_S3_BUCKET_UPLOAD_TEAMS_FOLDER', 'teams'),
        signedUrlExpireSeconds: getString('AWS_S3_SIGNED_URL_EXPIRE_SECONDS', '300')
      },
      cloudfront: {
        distStaticName: getString('AWS_CLOUDFRONT_STATIC_DIST_URL', 'https://static.operation-adrenaline.com')
      },
      dynamo: {
        region: getString('AWS_REGION', 'us-east-1'),
        tables: {
          bets: {
            name: getString('AWS_DYNAMO_TABLE_BETS', 'bets')
          },
          users: {
            name: getString('AWS_DYNAMO_TABLE_USERS', 'users')
          },
          teams: {
            name: getString('AWS_DYNAMO_TABLE_TEAMS', 'teams')
          },
          sessions: {
            name: getString('AWS_DYNAMO_TABLE_SESSIONS', 'sessions')
          },
          badges: {
            name: getString('AWS_DYNAMO_TABLE_BADGES', 'badges')
          },
          badgeAssignments: {
            name: getString('AWS_DYNAMO_TABLE_BADGE_ASSIGNMENTS', 'badges-assignments')
          },
          activities: {
            name: getString('AWS_DYNAMO_TABLE_ACTIVITIES', 'activities')
          },
          activityAssignments: {
            name: getString('AWS_DYNAMO_TABLE_ACTIVITY_ASSIGNMENTS', 'activity-assignments')
          },
          posts: {
            name: getString('AWS_DYNAMO_TABLE_POSTS', 'posts')
          },
          postComments: {
            name: getString('AWS_DYNAMO_TABLE_POST_COMMENTS', 'postComments')
          },
          metadata: {
            name: getString('AWS_DYNAMO_TABLE_METADATA', 'tables-metadata')
          }
        }
      }
    })
  }
}
