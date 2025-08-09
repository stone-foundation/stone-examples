import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { PostModel } from '../../models/Post'
import { ListMetadataOptions } from '../../models/App'
import { IPostRepository } from '../contracts/IPostRepository'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IBlueprint, isNotEmpty, isEmpty, Logger } from '@stone-js/core'

export interface DynamoPostRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
  metadataRepository: IMetadataRepository
}

export class DynamoPostRepository implements IPostRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, metadataRepository, database }: DynamoPostRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.tableName = blueprint.get('aws.dynamo.tables.posts.name', 'posts')
  }

  async list (limit?: number, cursor?: number | string): Promise<ListMetadataOptions<PostModel>> {
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
      items: (result.Items as PostModel[]) ?? [],
      nextPage: (result.LastEvaluatedKey != null)
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async listBy (conditions: Partial<PostModel>, limit?: number, cursor?: number | string): Promise<ListMetadataOptions<PostModel>> {
    let keyValue: any
    let keyName: string | undefined
    let indexName: string | undefined

    const keys = ['teamUuid', 'missionUuid']

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
        ScanIndexForward: false, // DESC order by createdAt
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
        items: (result.Items as PostModel[]) ?? [],
        nextPage: (result.LastEvaluatedKey != null)
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
          : undefined
      }
    }

    return await this.list(limit, cursor)
  }

  async findByUuid (uuid: string): Promise<PostModel | undefined> {
    return await this.findBy({ uuid })
  }

  async findBy (conditions: Partial<PostModel>): Promise<PostModel | undefined> {
    const keys = ['uuid', 'teamUuid', 'authorUuid']
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
        return result.Items?.[0] as PostModel | undefined
      }
    }
    return undefined
  }

  async create (post: PostModel): Promise<string | undefined> {
    await this.database.send(
      new PutCommand({
        TableName: this.tableName,
        Item: post,
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ConditionExpression: 'attribute_not_exists(#uuid)'
      })
    )
    await this.metadataRepository.increment(this.tableName, { lastUuid: post.uuid })
    return post.uuid
  }

  async update ({ uuid }: PostModel, data: Partial<PostModel>): Promise<PostModel | undefined> {
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

    return result.Attributes as PostModel | undefined
  }

  async delete ({ uuid }: PostModel): Promise<boolean> {
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
