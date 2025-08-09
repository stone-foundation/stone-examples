import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { User } from '../../models/User'
import { MissionModel } from '../../models/Mission'
import { ListMetadataOptions } from '../../models/App'
import { IMissionRepository } from '../contracts/IMissionRepository'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IBlueprint, isNotEmpty, isEmpty, Logger } from '@stone-js/core'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'

/**
 * Mission Repository Options
 */
export interface DynamoMissionRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
  metadataRepository: IMetadataRepository
  userHistoryRepository: IUserHistoryRepository
}

/**
 * Mission Repository (DynamoDB)
 */
export class DynamoMissionRepository implements IMissionRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient
  private readonly metadataRepository: IMetadataRepository
  private readonly userHistoryRepository: IUserHistoryRepository

  constructor ({ blueprint, database, metadataRepository, userHistoryRepository }: DynamoMissionRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.userHistoryRepository = userHistoryRepository
    this.tableName = blueprint.get('aws.dynamo.tables.missions.name', 'missions')
  }

  async list (limit?: number, cursor?: number | string): Promise<ListMetadataOptions<MissionModel>> {
    const params: any = {
      TableName: this.tableName,
      Limit: Number(limit ?? 10)
    }

    if (typeof cursor === 'string' && cursor.length > 0) {
      try {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'))
      } catch (error) {
        Logger.warn('Failed to parse cursor:', error)
      }
    }

    const total = await this.count()
    const result = await this.database.send(new ScanCommand(params))

    return {
      total,
      limit: Number(limit ?? 10),
      page: cursor,
      items: (result.Items as MissionModel[]) ?? [],
      nextPage: (result.LastEvaluatedKey != null)
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async listBy (conditions: Partial<MissionModel>, limit?: number, cursor?: number | string): Promise<ListMetadataOptions<MissionModel>> {
    let keyValue: any
    let keyName: string | undefined
    let indexName: string | undefined

    // Define which fields have indexes
    const indexedKeys = ['visibility']

    for (const [key, value] of Object.entries(conditions)) {
      if (indexedKeys.includes(key) && isNotEmpty(value)) {
        keyName = key
        keyValue = value
        indexName = `${key}-index`
        break
      }
    }

    if (keyName) {
      // Use Query on GSI for indexed fields
      const params: any = {
        TableName: this.tableName,
        IndexName: indexName,
        Limit: Number(limit ?? 10),
        KeyConditionExpression: `#${keyName} = :${keyName}`,
        ExpressionAttributeNames: { [`#${keyName}`]: keyName },
        ExpressionAttributeValues: { [`:${keyName}`]: keyValue }
      }

      if (typeof cursor === 'string' && cursor.length > 0) {
        try {
          params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'))
        } catch (error) {
          Logger.warn('Failed to parse cursor:', error)
        }
      }

      const total = await this.count()
      const result = await this.database.send(new QueryCommand(params))

      return {
        total,
        limit: Number(limit ?? 10),
        page: cursor,
        items: (result.Items as MissionModel[]) ?? [],
        nextPage: (result.LastEvaluatedKey != null)
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
          : undefined
      }
    }

    // Fallback to Scan with filter for non-indexed fields
    const filterExpressions: string[] = []
    const attrNames: Record<string, string> = {}
    const attrValues: Record<string, any> = {}

    for (const [key, value] of Object.entries(conditions)) {
      if (isNotEmpty(value)) {
        filterExpressions.push(`#${key} = :${key}`)
        attrNames[`#${key}`] = key
        attrValues[`:${key}`] = value
      }
    }

    const params: any = {
      TableName: this.tableName,
      Limit: Number(limit ?? 10)
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ')
      params.ExpressionAttributeNames = attrNames
      params.ExpressionAttributeValues = attrValues
    }

    if (typeof cursor === 'string' && cursor.length > 0) {
      try {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'))
      } catch (error) {
        Logger.warn('Failed to parse cursor:', error)
      }
    }

    const total = await this.count()
    const result = await this.database.send(new ScanCommand(params))

    return {
      total,
      limit: Number(limit ?? 10),
      page: cursor,
      items: (result.Items as MissionModel[]) ?? [],
      nextPage: (result.LastEvaluatedKey != null)
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async findByUuid (uuid: string): Promise<MissionModel | undefined> {
    const result = await this.database.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: '#uuid = :uuid',
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ExpressionAttributeValues: { ':uuid': uuid }
      })
    )

    return result.Items?.[0] as MissionModel | undefined
  }

  async findBy (conditions: Partial<MissionModel>): Promise<MissionModel | undefined> {
    // Primary key and indexed fields that can be used for efficient queries
    const queryableKeys = ['uuid', 'code', 'name', 'visibility']
    
    for (const [key, value] of Object.entries(conditions)) {
      if (queryableKeys.includes(key) && isNotEmpty(value)) {
        const params: any = {
          Limit: 1,
          TableName: this.tableName,
          KeyConditionExpression: `#${key} = :${key}`,
          ExpressionAttributeNames: { [`#${key}`]: key },
          ExpressionAttributeValues: { [`:${key}`]: value }
        }
        
        // Use index if not primary key
        if (key !== 'uuid') {
          params.IndexName = `${key}-index`
        }
        
        const result = await this.database.send(new QueryCommand(params))
        return result.Items?.[0] as MissionModel | undefined
      }
    }

    // Fallback to scan with filter for non-indexed fields
    const filterExpressions: string[] = []
    const attrNames: Record<string, string> = {}
    const attrValues: Record<string, any> = {}

    for (const [key, value] of Object.entries(conditions)) {
      if (isNotEmpty(value)) {
        filterExpressions.push(`#${key} = :${key}`)
        attrNames[`#${key}`] = key
        attrValues[`:${key}`] = value
      }
    }

    if (filterExpressions.length === 0) return undefined

    const params: any = {
      Limit: 1,
      TableName: this.tableName,
      FilterExpression: filterExpressions.join(' AND '),
      ExpressionAttributeNames: attrNames,
      ExpressionAttributeValues: attrValues
    }

    const result = await this.database.send(new ScanCommand(params))
    return result.Items?.[0] as MissionModel | undefined
  }

  async create (mission: MissionModel, author: User): Promise<string | undefined> {
    await this.database.send(
      new PutCommand({
        TableName: this.tableName,
        Item: mission,
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ConditionExpression: 'attribute_not_exists(#uuid)'
      })
    )
    
    await this.metadataRepository.increment(this.tableName, { lastUuid: mission.uuid })
    await this.userHistoryRepository.makeHistoryEntry({
      type: 'mission',
      action: 'created',
      itemUuid: mission.uuid,
    }, author)
    
    return mission.uuid
  }

  async update ({ uuid }: MissionModel, data: Partial<MissionModel>, author: User): Promise<MissionModel | undefined> {
    const updateExpr: string[] = []
    const attrNames: Record<string, string> = {}
    const attrValues: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      if (key === 'uuid' || isEmpty(value)) continue
      updateExpr.push(`#${key} = :${key}`)
      attrNames[`#${key}`] = key
      attrValues[`:${key}`] = value
    }

    if (updateExpr.length === 0) return await this.findByUuid(uuid)

    const result = await this.database.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { uuid },
        ReturnValues: 'ALL_NEW',
        ExpressionAttributeNames: attrNames,
        ExpressionAttributeValues: attrValues,
        UpdateExpression: `SET ${updateExpr.join(', ')}`
      })
    )

    await this.userHistoryRepository.makeHistoryEntry({
      itemUuid: uuid,
      type: 'mission',
      action: 'updated'
    }, author)

    return result.Attributes as MissionModel | undefined
  }

  async delete ({ uuid }: MissionModel, author: User): Promise<boolean> {
    try {
      await this.database.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { uuid },
          ExpressionAttributeNames: { '#uuid': 'uuid' },
          ConditionExpression: 'attribute_exists(#uuid)'
        })
      )
      
      await this.metadataRepository.decrement(this.tableName)
      await this.userHistoryRepository.makeHistoryEntry({
        itemUuid: uuid,
        type: 'mission',
        action: 'deleted',
      }, author)
      
      return true
    } catch (err: any) {
      if (err.name === 'ConditionalCheckFailedException') return false
      throw err
    }
  }

  async count (): Promise<number> {
    const meta = await this.metadataRepository.get(this.tableName)
    return meta?.total ?? 0
  }
}