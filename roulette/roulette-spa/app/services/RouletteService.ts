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
 *
 * @Service() decorator is used to define a new service
 * @Service() is an alias of @Stone() decorator.
 * The alias is required to get benefits of desctructuring Dependency Injection.
 * And because the front-end class will be minified, we need to use alias to keep the class name.
*/
@Service({ alias: 'rouletteService' })
export class RouletteService {
  private readonly rouletteClient: RouletteClient

  /**
   * Create a new Roulette Service
  */
  constructor ({ rouletteClient }: RouletteServiceOptions) {
    this.rouletteClient = rouletteClient
  }

  /**
   * Spin the roulette
   *
   * @returns The color of the roulette
   */
  async spin (): Promise<SpinResult> {
    return await this.rouletteClient.spin()
  }
}
