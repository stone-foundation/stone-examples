import { AxiosClient } from './AxiosClient'
import { SpinResult } from '../models/Roulette'
import { IBlueprint, Stone } from '@stone-js/core'

/**
 * Roulette Client Options
*/
export interface RouletteClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Roulette Client
 */
@Stone({ alias: 'rouletteClient' })
export class RouletteClient {
  private readonly path: string
  private readonly client: AxiosClient

  /**
   * Create a new Roulette Client
   *
   * @param options - The options to create the Roulette Client.
   */
  constructor ({ blueprint, httpClient }: RouletteClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.roulette.path', '/roulette')
  }

  /**
   * Spin the roulette
   */
  async spin (): Promise<SpinResult> {
    return await this.client.post(`${this.path}/spin`)
  }
}
