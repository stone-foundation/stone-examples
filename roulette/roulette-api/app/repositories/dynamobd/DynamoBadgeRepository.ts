import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { BadgeModel } from '../../models/Badge'
import { ListMetadataOptions } from '../../models/App'
import { IBadgeRepository } from '../contracts/IBadgeRepository'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IBlueprint, isNotEmpty, isEmpty, Logger } from '@stone-js/core'

/**
 * Badge Repository Options
 */
export interface DynamoBadgeRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
  metadataRepository: IMetadataRepository
}

/**
 * Badge Repository (DynamoDB)
 */
export class DynamoBadgeRepository implements IBadgeRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, metadataRepository, database }: DynamoBadgeRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.tableName = blueprint.get('aws.dynamo.tables.badges.name', 'badges')
  }

  async list (limit?: number, cursor?: number | string): Promise<ListMetadataOptions<BadgeModel>> {
    const params: any = {
      TableName: this.tableName,
      Limit: Number(limit)
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
      limit,
      page: cursor,
      items: (result.Items as BadgeModel[]) ?? [],
      nextPage: (result.LastEvaluatedKey != null)
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async listBy (conditions: Partial<BadgeModel>, limit?: number, cursor?: number | string): Promise<ListMetadataOptions<BadgeModel>> {
    let keyValue: any
    let keyName: string | undefined
    let indexName: string | undefined

    const keys = ['name', 'category']

    for (const [key, value] of Object.entries(conditions)) {
      if (isNotEmpty(keys.includes(key)) && isNotEmpty(value)) {
        keyName = key
        keyValue = value
        indexName = `${key}-index`
        break
      }
    }

    if (keyName) {
      const params: any = {
        TableName: this.tableName,
        IndexName: indexName,
        Limit: Number(limit),
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
        limit,
        page: cursor,
        items: (result.Items as BadgeModel[]) ?? [],
        nextPage: (result.LastEvaluatedKey != null)
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
          : undefined
      }
    }

    // fallback to global list
    return await this.list(limit, cursor)
  }

  async findByUuid (uuid: string): Promise<BadgeModel | undefined> {
    return await this.findBy({ uuid })
  }

  async findBy (conditions: Partial<BadgeModel>): Promise<BadgeModel | undefined> {
    const keys = ['uuid', 'name', 'category']
    for (const [key, value] of Object.entries(conditions)) {
      if (isNotEmpty(keys.includes(key)) && isNotEmpty(value)) {
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
        return result.Items?.[0] as BadgeModel | undefined
      }
    }
    return undefined
  }

  async create (badge: BadgeModel): Promise<string | undefined> {
    await this.database.send(
      new PutCommand({
        TableName: this.tableName,
        Item: badge,
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ConditionExpression: 'attribute_not_exists(#uuid)'
      })
    )
    await this.metadataRepository.increment(this.tableName, { lastUuid: badge.uuid })
    return badge.uuid
  }

  async update ({ uuid }: BadgeModel, data: Partial<BadgeModel>): Promise<BadgeModel | undefined> {
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

    return result.Attributes as BadgeModel | undefined
  }

  async delete ({ uuid }: BadgeModel): Promise<boolean> {
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
