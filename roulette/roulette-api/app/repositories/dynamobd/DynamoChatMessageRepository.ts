import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { ListMetadataOptions } from '../../models/App'
import { ChatMessageModel } from '../../models/Chatbot'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IBlueprint, isNotEmpty, isEmpty, Logger } from '@stone-js/core'
import { IChatMessageRepository } from '../contracts/IChatMessageRepository'

/**
 * ChatMessage Repository Options
 */
export interface DynamoChatMessageRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
  metadataRepository: IMetadataRepository
}

/**
 * ChatMessage Repository (DynamoDB)
 */
export class DynamoChatMessageRepository implements IChatMessageRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, database, metadataRepository }: DynamoChatMessageRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.tableName = blueprint.get('aws.dynamo.tables.chatMessages.name', 'chat_messages')
  }

  async list (limit?: number, cursor?: number | string): Promise<ListMetadataOptions<ChatMessageModel>> {
    const params: any = {
      TableName: this.tableName,
      IndexName: 'createdAt-index', // GSI with constant PK + createdAt SK
      Limit: Number(limit ?? 10),
      ScanIndexForward: false, // DESC order by createdAt
      KeyConditionExpression: '#gsiPK = :gsiPK',
      ExpressionAttributeNames: { '#gsiPK': 'gsiPK' },
      ExpressionAttributeValues: { ':gsiPK': 'chat_messages' }
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
      items: (result.Items as ChatMessageModel[]) ?? [],
      nextPage: (result.LastEvaluatedKey != null)
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async listBy (conditions: Partial<ChatMessageModel>, limit?: number, cursor?: number | string): Promise<ListMetadataOptions<ChatMessageModel>> {
    let keyValue: any
    let keyName: string | undefined
    let indexName: string | undefined

    // Define which fields have indexes
    const indexedKeys: string[] = []

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
        items: (result.Items as ChatMessageModel[]) ?? [],
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
      items: (result.Items as ChatMessageModel[]) ?? [],
      nextPage: (result.LastEvaluatedKey != null)
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async findByUuid (uuid: string): Promise<ChatMessageModel | undefined> {
    const result = await this.database.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: '#uuid = :uuid',
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ExpressionAttributeValues: { ':uuid': uuid }
      })
    )

    return result.Items?.[0] as ChatMessageModel | undefined
  }

  async findBy (conditions: Partial<ChatMessageModel>): Promise<ChatMessageModel | undefined> {
    // Primary key and indexed fields that can be used for efficient queries
    const queryableKeys = ['uuid', 'role', 'authorUuid', 'modelRef']
    
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
        return result.Items?.[0] as ChatMessageModel | undefined
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
    return result.Items?.[0] as ChatMessageModel | undefined
  }

  async create (chatMessage: ChatMessageModel): Promise<string | undefined> {
    // Add constant partition key for global ordering GSI
    const enrichedMessage = {
      ...chatMessage,
      gsiPK: 'chat_messages'
    }

    await this.database.send(
      new PutCommand({
        TableName: this.tableName,
        Item: enrichedMessage,
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ConditionExpression: 'attribute_not_exists(#uuid)'
      })
    )
    await this.metadataRepository.increment(this.tableName, { lastUuid: chatMessage.uuid })
    return chatMessage.uuid
  }

  async update ({ uuid }: ChatMessageModel, data: Partial<ChatMessageModel>): Promise<ChatMessageModel | undefined> {
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

    return result.Attributes as ChatMessageModel | undefined
  }

  async delete ({ uuid }: ChatMessageModel): Promise<boolean> {
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

  async count (): Promise<number> {
    const meta = await this.metadataRepository.get(this.tableName)
    return meta?.total ?? 0
  }
}