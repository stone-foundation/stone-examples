import { Service } from '@stone-js/core'
import { SpinResult } from '../models/Roulette'
import { RouletteClient } from '../clients/RouletteClient'

/**
 * Roulette Service Options
*/
export interface RouletteServiceOptions {
  rouletteClient: RouletteClient
}

/**
 * Roulette Service
*/
@Service({ alias: 'rouletteService' })
export class RouletteService {
  private readonly client: RouletteClient

  /**
   * Create a new Roulette Service
  */
  constructor ({ rouletteClient }: RouletteServiceOptions) {
    this.client = rouletteClient
  }

  /**
   * Spin the roulette
   *
   * @returns The color of the roulette
   */
  async spin (): Promise<SpinResult> {
    return await this.client.spin()
  }
}
