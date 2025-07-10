import { MetadataModel } from "../../models/App"

/**
 * Metadata table Repository contract
 */
export interface IMetadataRepository {
  /**
   * Get meta by table name
   *
   * @param table - ex: 'badges', 'users'
   * @returns Meta object or undefined
   */
  get: (table: string) => Promise<MetadataModel | undefined>

  /**
   * Increment total and update meta
   */
  increment: (table: string, data: Partial<MetadataModel>) => Promise<void>

  /**
   * Decrement total and update meta
   */
  decrement: (table: string, data?: Partial<MetadataModel>) => Promise<void>
}