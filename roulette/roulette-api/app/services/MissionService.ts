import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { MediaService } from './MediaService'
import { generateRandomCode } from '../utils'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { Mission, MissionModel } from '../models/Mission'
import { IContainer, isNotEmpty, Service } from '@stone-js/core'
import { IMissionRepository } from '../repositories/contracts/IMissionRepository'

/**
 * Mission Service Options
 */
export interface MissionServiceOptions {
  mediaService: MediaService
  missionRepository: IMissionRepository
}

/**
 * Mission Service
 */
@Service({ alias: 'missionService' })
export class MissionService {
  private readonly mediaService: MediaService
  private readonly missionRepository: IMissionRepository

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<Mission | undefined> {
    const missionService = container.resolve<MissionService>('missionService')
    return await missionService.findBy({ [key]: value })
  }

  /**
   * Create a new Mission Service
   */
  constructor ({ missionRepository, mediaService }: MissionServiceOptions) {
    this.mediaService = mediaService
    this.missionRepository = missionRepository
  }

  /**
   * List all missions
   */
  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Mission>> {
    const result = await this.missionRepository.list(limit, page)
    const items = result.items.map(v => this.toMission(v))
    return { ...result, items }
  }

  /**
   * List missions by conditions
   */
  async listBy (conditions: Partial<MissionModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Mission>> {
    const result = await this.missionRepository.listBy(conditions, limit, page)
    const items = result.items.map(v => this.toMission(v))
    return { ...result, items }
  }

  /**
   * Find a mission
   *
   * @param conditions - The conditions to find the mission
   * @returns The found mission
   */
  async findBy (conditions: Record<string, any>): Promise<Mission> {
    const missionModel = await this.missionRepository.findBy(conditions)
    if (isNotEmpty<MissionModel>(missionModel)) return this.toMission(missionModel)
    throw new NotFoundError(`The mission with conditions ${JSON.stringify(conditions)} not found`)
  }

  /**
   * Find a mission by uuid
   *
   * @param uuid - The uuid of the mission to find
   * @returns The found mission or undefined if not found
   */
  async findByUuid (uuid: string): Promise<Mission | undefined> {
    const missionModel = await this.missionRepository.findByUuid(uuid)
    if (isNotEmpty<MissionModel>(missionModel)) return this.toMission(missionModel)
  }

  /**
   * Check if a mission exists by conditions
   *
   * @param conditions - The conditions to check
   * @returns True if the mission exists, false otherwise
   */
  async existsBy (conditions: Record<string, any>): Promise<boolean> {
    const missionModel = await this.missionRepository.findBy(conditions)
    return isNotEmpty<MissionModel>(missionModel)
  }

  /**
   * Find active missions (missions that haven't ended yet)
   *
   * @param limit - Maximum number of results
   * @param page - Page number for pagination
   * @returns The found active missions
   */
  async findActiveMissions (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Mission>> {
    const result = await this.missionRepository.list(limit, page)
    const currentTime = Date.now()
    const activeItems = result.items
      .filter(mission => !mission.endDate || mission.endDate > currentTime)
      .map(v => this.toMission(v))
    
    return { ...result, items: activeItems }
  }

  /**
   * Create a mission
   *
   * @param mission - The mission to create
   * @param author - The user who is creating the mission
   * @returns The uuid of the created mission
   */
  async create (mission: Mission, author: User): Promise<string | undefined> {
    const count = await this.missionRepository.count()
    const code = generateRandomCode(`M-${count + 1}`, 8)
    return await this.missionRepository.create({
      ...mission,
      code,
      uuid: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }, author)
  }

  /**
   * Update a mission
   *
   * @param mission - The mission to update
   * @param data - The data to update in the mission
   * @param author - The user who is updating the mission
   * @returns The updated mission
   */
  async update (mission: Mission, data: Partial<Mission>, author: User): Promise<Mission> {
    data.updatedAt = Date.now()
    const missionModel = await this.missionRepository.update(mission, data, author)
    if (isNotEmpty<MissionModel>(missionModel)) return this.toMission(missionModel)
    throw new NotFoundError(`Mission with ID ${mission.uuid} not found`)
  }

  /**
   * Delete a mission
   *
   * @param mission - The mission to delete
   * @param author - The user who is deleting the mission
   * @returns True if the mission was deleted, false otherwise
   */
  async delete (mission: Mission, author: User): Promise<boolean> {
    await this.mediaService.deleteS3Object(mission.imageUrl)
    return await this.missionRepository.delete(mission, author)
  }

  /**
   * Get total mission count
   *
   * @returns The total count of missions
   */
  async count (): Promise<number> {
    return await this.missionRepository.count()
  }

  /**
   * Check if mission is active
   *
   * @param mission - The mission to check
   * @returns True if mission is active, false otherwise
   */
  isActive (mission: Mission): boolean {
    const currentTime = Date.now()
    const hasNotEnded = !mission.endDate || mission.endDate > currentTime
    const hasStarted = !mission.startDate || mission.startDate <= currentTime
    return hasStarted && hasNotEnded
  }

  /**
   * Get mission duration in milliseconds
   *
   * @param mission - The mission to calculate duration for
   * @returns Duration in milliseconds, or null if no end date
   */
  getDuration (mission: Mission): number | null {
    if (!mission.startDate || !mission.endDate) return null
    return mission.endDate - mission.startDate
  }

  /**
   * Convert MissionModel to Mission
   *
   * @param missionModel - The mission model to convert
   * @returns The converted mission
   */
  toMission (missionModel: MissionModel): Mission {
    return { ...missionModel }
  }
}