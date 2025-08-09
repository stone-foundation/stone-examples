import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'node:crypto'
import { ListMetadataOptions } from '../../models/App'
import { User, UserHistoryModel } from '../../models/User'
import { IBlueprint, isNotEmpty, Logger } from '@stone-js/core'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'

/**
 * UserHistory Repository Options
 */
export interface DynamoUserHistoryRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
  metadataRepository: IMetadataRepository
}

/**
 * UserHistory Repository (DynamoDB)
 */
export class DynamoUserHistoryRepository implements IUserHistoryRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, database, metadataRepository }: DynamoUserHistoryRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.tableName = blueprint.get('aws.dynamo.tables.userHistories.name', 'user_histories')
  }

  async list (limit?: number, cursor?: number | string): Promise<ListMetadataOptions<UserHistoryModel>> {
    const params: any = {
      TableName: this.tableName,
      IndexName: 'createdAt-global-index', // GSI with constant PK + createdAt SK for chronological order
      Limit: Number(limit ?? 10),
      ScanIndexForward: false, // DESC order by createdAt
      KeyConditionExpression: '#gsiPK = :gsiPK',
      ExpressionAttributeNames: { '#gsiPK': 'gsiPK' },
      ExpressionAttributeValues: { ':gsiPK': 'user_histories' }
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
      items: (result.Items as UserHistoryModel[]) ?? [],
      nextPage: (result.LastEvaluatedKey != null)
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async listBy (conditions: Partial<UserHistoryModel>, limit?: number, cursor?: number | string): Promise<ListMetadataOptions<UserHistoryModel>> {
    let keyValue: any
    let keyName: string | undefined
    let indexName: string | undefined

    // Define which fields have indexes
    const indexedKeys = ['type', 'action', 'authorUuid']

    for (const [key, value] of Object.entries(conditions)) {
      if (indexedKeys.includes(key) && isNotEmpty(value)) {
        keyName = key
        keyValue = value
        indexName = `${key}-index`
        break
      }
    }

    if (keyName) {
      // Use Query on GSI for indexed fields with createdAt ordering
      const params: any = {
        TableName: this.tableName,
        IndexName: indexName,
        Limit: Number(limit ?? 10),
        ScanIndexForward: false, // DESC order by createdAt (if createdAt is SK)
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
        items: (result.Items as UserHistoryModel[]) ?? [],
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
      items: (result.Items as UserHistoryModel[]) ?? [],
      nextPage: (result.LastEvaluatedKey != null)
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async findById (id: number): Promise<UserHistoryModel | undefined> {
    // Note: DynamoDB doesn't have auto-increment IDs, this method searches by id field
    const params = {
      TableName: this.tableName,
      FilterExpression: '#id = :id',
      ExpressionAttributeNames: { '#id': 'id' },
      ExpressionAttributeValues: { ':id': id },
      Limit: 1
    }

    const result = await this.database.send(new ScanCommand(params))
    return result.Items?.[0] as UserHistoryModel | undefined
  }

  async findBy (conditions: Partial<UserHistoryModel>): Promise<UserHistoryModel | undefined> {
    // Primary key and indexed fields that can be used for efficient queries
    const queryableKeys = ['uuid', 'type', 'action', 'authorUuid']
    
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
        return result.Items?.[0] as UserHistoryModel | undefined
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
    return result.Items?.[0] as UserHistoryModel | undefined
  }

  async create (userHistory: UserHistoryModel, author: User): Promise<string | undefined> {
    // Add constant partition key for global ordering GSI + set authorUuid
    const enrichedUserHistory = {
      ...userHistory,
      authorUuid: author.uuid,
      gsiPK: 'user_histories'
    }

    await this.database.send(
      new PutCommand({
        TableName: this.tableName,
        Item: enrichedUserHistory,
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ConditionExpression: 'attribute_not_exists(#uuid)'
      })
    )
    
    await this.metadataRepository.increment(this.tableName, { lastUuid: userHistory.uuid })
    return userHistory.uuid
  }

  async delete ({ uuid }: UserHistoryModel): Promise<boolean> {
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
      return true
    } catch (err: any) {
      if (err.name === 'ConditionalCheckFailedException') return false
      throw err
    }
  }

  async makeHistoryEntry (userHistory: Partial<UserHistoryModel>, author: User): Promise<string | undefined> {
    return await this.create({
      itemUuid: '',
      type: 'user',
      authorUuid: '',
      action: 'created',
      ...userHistory,
      uuid: randomUUID(),
      createdAt: Date.now(),
    }, author)
  }

  async count (): Promise<number> {
    const meta = await this.metadataRepository.get(this.tableName)
    return meta?.total ?? 0
  }
}