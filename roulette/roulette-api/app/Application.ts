import {
  AwsLambdaHttp,
  MetaBodyEventMiddleware as AwsMetaBodyEventMiddleware,
  MetaFilesEventMiddleware as AwsMetaFilesEventMiddleware
} from '@stone-js/aws-lambda-http-adapter'
import { Routing } from '@stone-js/router'
import { StoneApp, LogLevel } from '@stone-js/core'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { MetaBodyEventMiddleware, MetaFilesEventMiddleware, NodeHttp } from '@stone-js/node-http-adapter'

/**
 * My Roulette API Application
 */
@Routing()
@NodeConsole()
@StoneApp({ name: 'Roulette API', logger: { level: LogLevel.INFO } })
@NodeHttp({ middleware: [MetaBodyEventMiddleware, MetaFilesEventMiddleware] })
@AwsLambdaHttp({ middleware: [AwsMetaBodyEventMiddleware, AwsMetaFilesEventMiddleware] })
export class Application {}
