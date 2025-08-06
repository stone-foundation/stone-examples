import { User } from '../../models/User'
import { SpinModel } from '../../models/Spin'

/**
 * Spin Repository contract
 */
export interface ISpinRepository {
  /**
   * List spins
   *
   * @param limit - The limit of spins to list
   * @returns The list of spins
   */
  list: (limit: number) => Promise<SpinModel[]>

  /**
   * Find a spin by uuid
   *
   * @param uuid - The uuid of the spin to find
   * @returns The spin or undefined if not found
   */
  findByUuid: (uuid: string) => Promise<SpinModel | undefined>

  /**
   * Find a spin by dynamic conditions
   *
   * @param conditions - Conditions to match the spin
   * @returns The spin or undefined if not found
   */
  findBy: (conditions: Partial<SpinModel>) => Promise<SpinModel | undefined>

  /**
   * Create a spin
   *
   * @param spin - The spin to create
   * @param author - User creating the spin
   * @returns The uuid of the created spin
   */
  create: (spin: SpinModel, author: User) => Promise<string | undefined>
}
