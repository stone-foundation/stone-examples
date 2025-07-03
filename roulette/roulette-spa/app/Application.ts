import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application
 *
 * This is the main application entry point.
 *
 * @UseReact() is used to enable the React.
 * @Browser() is used to enable the Browser adapter.
 * @Routing() is used to enable the routing feature.
 * @NodeHttp() is used to enable the Node HTTP adapter.
 * @StoneApp() is used to enable the Stone application, it is required.
 *
 * Lifecycle hooks are used here just for demonstration purposes.
 */
@Routing()
@Browser()
@UseReact()
@StoneApp({ name: 'Operation Adrenaline', logger: { level: LogLevel.INFO } })
export class Application {}
