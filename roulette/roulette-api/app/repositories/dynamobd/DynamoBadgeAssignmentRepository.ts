import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { ListMetadataOptions } from '../../models/App'
import { BadgeAssignmentModel } from '../../models/Badge'
import { IBlueprint, isNotEmpty, isEmpty } from '@stone-js/core'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IBadgeAssignmentRepository } from '../contracts/IBadgeAssignmentRepository'

export interface DynamoBadgeAssignmentRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
  metadataRepository: IMetadataRepository
}

export class DynamoBadgeAssignmentRepository implements IBadgeAssignmentRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, metadataRepository, database }: DynamoBadgeAssignmentRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.tableName = blueprint.get('aws.dynamo.tables.badgeAssignments.name', 'badge_assignments')
  }

  async list (limit?: number, cursor?: number | string): Promise<ListMetadataOptions<BadgeAssignmentModel>> {
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
      items: (result.Items as BadgeAssignmentModel[]) ?? [],
      nextPage: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async listBy (conditions: Partial<BadgeAssignmentModel>, limit?: number, cursor?: number | string): Promise<ListMetadataOptions<BadgeAssignmentModel>> {
    let keyValue: any
    let keyName: string | undefined
    let indexName: string | undefined

    if (isNotEmpty(conditions.badgeUuid)) {
      indexName = 'badgeUuid-index'
      keyName = 'badgeUuid'
      keyValue = conditions.badgeUuid
    } else if (isNotEmpty(conditions.memberUuid)) {
      indexName = 'memberUuid-index'
      keyName = 'memberUuid'
      keyValue = conditions.memberUuid
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
        items: (result.Items as BadgeAssignmentModel[]) ?? [],
        nextPage: result.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
          : undefined
      }
    }

    return await this.list(limit, cursor)
  }

  async findByUuid (uuid: string): Promise<BadgeAssignmentModel | undefined> {
    return await this.findBy({ uuid })
  }

  async findBy (conditions: Partial<BadgeAssignmentModel>): Promise<BadgeAssignmentModel | undefined> {
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
      return result.Items?.[0] as BadgeAssignmentModel | undefined
    }
    return undefined
  }

  async create (assignment: BadgeAssignmentModel): Promise<string | undefined> {
    await this.database.send(
      new PutCommand({
        TableName: this.tableName,
        Item: assignment,
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ConditionExpression: 'attribute_not_exists(#uuid)'
      })
    )
    await this.metadataRepository.increment(this.tableName, { lastUuid: assignment.uuid })
    return assignment.uuid
  }

  async update ({ uuid }: BadgeAssignmentModel, data: Partial<BadgeAssignmentModel>): Promise<BadgeAssignmentModel | undefined> {
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

    return result.Attributes as BadgeAssignmentModel | undefined
  }

  async delete ({ uuid }: BadgeAssignmentModel): Promise<boolean> {
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
