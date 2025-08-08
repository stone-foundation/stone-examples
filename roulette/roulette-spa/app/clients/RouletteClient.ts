import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'
import { SpinPayload, SpinResult } from '../models/Roulette'

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
  async spin (data: SpinPayload): Promise<SpinResult> {
    return await this.client.post(`${this.path}/spin`, data)
  }
}
