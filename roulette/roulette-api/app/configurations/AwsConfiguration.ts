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
      dynamo: {
        region: getString('AWS_REGION', 'us-east-1')
      },
      sns: {
        region: getString('AWS_REGION', 'us-east-1')
      }
    })
  }
}
