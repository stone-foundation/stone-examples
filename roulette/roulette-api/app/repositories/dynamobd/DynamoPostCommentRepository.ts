import {
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { PostCommentModel } from '../../models/Post'
import { IPostCommentRepository } from '../contracts/IPostCommentRepository'
import { ListMetadataOptions } from '../../models/App'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IBlueprint, isNotEmpty, isEmpty } from '@stone-js/core'

export interface DynamoPostCommentRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
  metadataRepository: IMetadataRepository
}

export class DynamoPostCommentRepository implements IPostCommentRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, metadataRepository, database }: DynamoPostCommentRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.tableName = blueprint.get('aws.dynamo.tables.postComments.name', 'postComments')
  }

  async list (limit?: number, cursor?: number | string): Promise<ListMetadataOptions<PostCommentModel>> {
    const params: any = {
      TableName: this.tableName,
      Limit: Number(limit)
    }

    if (typeof cursor === 'string' && cursor.length > 0) {
      params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'))
    }

    const total = await this.count()
    const result = await this.database.send(new ScanCommand(params))

    return {
      total,
      limit,
      page: cursor,
      items: (result.Items as PostCommentModel[]) ?? [],
      nextPage: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async listBy (conditions: Partial<PostCommentModel>, limit?: number, cursor?: number | string): Promise<ListMetadataOptions<PostCommentModel>> {
    let keyName: string | undefined
    let keyValue: any
    let indexName: string | undefined

    if (isNotEmpty(conditions.postUuid)) {
      keyName = 'postUuid'
      keyValue = conditions.postUuid
      indexName = 'postUuid-index'
    } else if (isNotEmpty(conditions.authorUuid)) {
      keyName = 'authorUuid'
      keyValue = conditions.authorUuid
      indexName = 'authorUuid-index'
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
        params.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'))
      }

      const total = await this.count()
      const result = await this.database.send(new QueryCommand(params))

      return {
        total,
        limit,
        page: cursor,
        items: (result.Items as PostCommentModel[]) ?? [],
        nextPage: result.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
          : undefined
      }
    }

    return await this.list(limit, cursor)
  }

  async findByUuid (uuid: string): Promise<PostCommentModel | undefined> {
    return await this.findBy({ uuid })
  }

  async findBy (conditions: Partial<PostCommentModel>): Promise<PostCommentModel | undefined> {
    if (isNotEmpty(conditions.uuid)) {
      const result = await this.database.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: '#uuid = :uuid',
          ExpressionAttributeNames: { '#uuid': 'uuid' },
          ExpressionAttributeValues: { ':uuid': conditions.uuid },
          Limit: 1
        })
      )
      return result.Items?.[0] as PostCommentModel | undefined
    }

    return undefined
  }

  async create (comment: PostCommentModel): Promise<string | undefined> {
    await this.database.send(
      new PutCommand({
        TableName: this.tableName,
        Item: comment,
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ConditionExpression: 'attribute_not_exists(#uuid)'
      })
    )
    await this.metadataRepository.increment(this.tableName, { lastUuid: comment.uuid })
    return comment.uuid
  }

  async update ({ uuid }: PostCommentModel, data: Partial<PostCommentModel>): Promise<PostCommentModel | undefined> {
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

    return result.Attributes as PostCommentModel | undefined
  }

  async delete ({ uuid }: PostCommentModel): Promise<boolean> {
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
