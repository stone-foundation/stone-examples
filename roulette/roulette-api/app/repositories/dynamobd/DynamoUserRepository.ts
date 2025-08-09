import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { UserModel } from '../../models/User'
import { ListMetadataOptions } from '../../models/App'
import { IUserRepository } from '../contracts/IUserRepository'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IBlueprint, isEmpty, isNotEmpty, Logger } from '@stone-js/core'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'

/**
 * User Repository Options
 */
export interface DynamoUserRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
  metadataRepository: IMetadataRepository
  userHistoryRepository: IUserHistoryRepository
}

/**
 * User Repository (DynamoDB)
 */
export class DynamoUserRepository implements IUserRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient
  private readonly metadataRepository: IMetadataRepository
  private readonly userHistoryRepository: IUserHistoryRepository

  constructor ({ database, blueprint, metadataRepository, userHistoryRepository }: DynamoUserRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.userHistoryRepository = userHistoryRepository
    this.tableName = blueprint.get('aws.dynamo.tables.users.name', 'users')
  }

  async list (limit?: number, cursor?: number | string): Promise<ListMetadataOptions<UserModel>> {
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
      items: (result.Items as UserModel[]) ?? [],
      nextPage: (result.LastEvaluatedKey != null)
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async listBy (conditions: Partial<UserModel>, limit?: number, cursor?: number | string): Promise<ListMetadataOptions<UserModel>> {
    let keyValue: any
    let keyName: string | undefined
    let indexName: string | undefined

    // Define which fields have indexes
    const indexedKeys = ['teamUuid', 'phone', 'username']

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
        items: (result.Items as UserModel[]) ?? [],
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
      items: (result.Items as UserModel[]) ?? [],
      nextPage: (result.LastEvaluatedKey != null)
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async findByUuid (uuid: string): Promise<UserModel | undefined> {
    const result = await this.database.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: '#uuid = :uuid',
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ExpressionAttributeValues: { ':uuid': uuid }
      })
    )

    return result.Items?.[0] as UserModel | undefined
  }

  async findBy (conditions: Partial<UserModel>): Promise<UserModel | undefined> {
    // Primary key and indexed fields that can be used for efficient queries
    const queryableKeys = ['uuid', 'phone', 'username', 'teamUuid']
    
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
        return result.Items?.[0] as UserModel | undefined
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
    return result.Items?.[0] as UserModel | undefined
  }

  async create (user: UserModel, author: UserModel): Promise<string | undefined> {
    await this.database.send(
      new PutCommand({
        TableName: this.tableName,
        Item: user,
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ConditionExpression: 'attribute_not_exists(#uuid)'
      })
    )
    
    await this.metadataRepository.increment(this.tableName, { lastUuid: user.uuid })
    await this.userHistoryRepository.makeHistoryEntry({
      type: 'user',
      action: 'created',
      itemUuid: user.uuid,
    }, author)
    
    return user.uuid
  }

  async update ({ uuid, username }: UserModel, data: Partial<UserModel>, author: UserModel): Promise<UserModel | undefined> {
    const updateExpr: string[] = []
    const attrNames: Record<string, string> = {}
    const attrValues: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      // Keep original logic: skip uuid and username if empty (immutable fields)
      if (['uuid', 'username'].includes(key) && isEmpty(value)) continue
      updateExpr.push(`#${key} = :${key}`)
      attrNames[`#${key}`] = key
      attrValues[`:${key}`] = value
    }

    if (updateExpr.length === 0) return await this.findByUuid(uuid)

    // Handle composite key properly - use both uuid and username if username is part of primary key
    const key = username ? { uuid, username } : { uuid }

    const result = await this.database.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: key,
        ReturnValues: 'ALL_NEW',
        ExpressionAttributeNames: attrNames,
        ExpressionAttributeValues: attrValues,
        UpdateExpression: `SET ${updateExpr.join(', ')}`
      })
    )

    await this.userHistoryRepository.makeHistoryEntry({
      itemUuid: uuid,
      type: 'user',
      action: 'updated'
    }, author)

    return result.Attributes as UserModel | undefined
  }

  async delete ({ uuid, username }: UserModel, author: UserModel): Promise<boolean> {
    try {
      // Handle composite key properly - use both uuid and username if username is part of primary key
      const key = username ? { uuid, username } : { uuid }

      await this.database.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: key,
          ExpressionAttributeNames: { '#uuid': 'uuid' },
          ConditionExpression: 'attribute_exists(#uuid)'
        })
      )
      
      await this.metadataRepository.decrement(this.tableName)
      await this.userHistoryRepository.makeHistoryEntry({
        itemUuid: uuid,
        type: 'user',
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