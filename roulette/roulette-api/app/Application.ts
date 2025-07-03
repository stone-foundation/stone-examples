import {
  AwsLambdaHttp,
  MetaBodyEventMiddleware as AwsMetaBodyEventMiddleware,
  MetaFilesEventMiddleware as AwsMetaFilesEventMiddleware
} from '@stone-js/aws-lambda-http-adapter'
import { Routing } from '@stone-js/router'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { StoneApp, LogLevel, AdapterHookListenerContext, Hook, Logger } from '@stone-js/core'
import { MetaBodyEventMiddleware, MetaFilesEventMiddleware, NodeHttp } from '@stone-js/node-http-adapter'

/**
 * Application
 *
 * Lifecycle hooks are used here just for demonstration purposes.
 */
@Routing()
@NodeConsole()
@StoneApp({ name: 'Roulette API', logger: { level: LogLevel.INFO } })
@NodeHttp({ middleware: [MetaBodyEventMiddleware, MetaFilesEventMiddleware] })
@AwsLambdaHttp({ middleware: [AwsMetaBodyEventMiddleware, AwsMetaFilesEventMiddleware] })
export class Application {
  /**
   * Run just before the application stops
   *
   * @param blueprint - The blueprint
   */
  @Hook('onStart')
  startApp ({ blueprint }: AdapterHookListenerContext): void {
    Logger.info('Application is starting', blueprint.get('stone.name'))
  }
}
