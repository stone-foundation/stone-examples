import '../assets/css/index.css'
import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Roulette SPA Application
 */
@Routing()
@Browser()
@UseReact()
@StoneApp({ name: 'Operation Adrenaline', logger: { level: LogLevel.INFO } })
export class Application {}
