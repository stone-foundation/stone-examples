import { ListMetadataOptions } from "../../models/App"
import { ActivityAssignmentModel } from "../../models/Activity"
import { IBlueprint, isNotEmpty, isEmpty } from "@stone-js/core"
import { ScanCommand, QueryCommand } from "@aws-sdk/client-dynamodb"
import { IMetadataRepository } from "../contracts/IMetadataRepository"
import { IActivityAssignmentRepository } from "../contracts/IActivityAssignmentRepository"
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb"

export interface DynamoActivityAssignmentRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
  metadataRepository: IMetadataRepository
}

export class DynamoActivityAssignmentRepository implements IActivityAssignmentRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, metadataRepository, database }: DynamoActivityAssignmentRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.tableName = blueprint.get('aws.dynamo.tables.activityAssignments.name', 'activity_assignments')
  }

  async list (limit?: number, cursor?: number | string): Promise<ListMetadataOptions<ActivityAssignmentModel>> {
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
      items: (result.Items as unknown as ActivityAssignmentModel[]) ?? [],
      nextPage: result.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
        : undefined
    }
  }

  async listBy (conditions: Partial<ActivityAssignmentModel>, limit?: number, cursor?: number | string): Promise<ListMetadataOptions<ActivityAssignmentModel>> {
    let keyValue: any
    let keyName: string | undefined
    let indexName: string | undefined

    if (isNotEmpty(conditions.badgeUuid)) {
      indexName = 'badgeUuid-index'
      keyName = 'badgeUuid'
      keyValue = conditions.badgeUuid
    } else if (isNotEmpty(conditions.activityUuid)) {
      indexName = 'activityUuid-index'
      keyName = 'activityUuid'
      keyValue = conditions.activityUuid
    } else if (isNotEmpty(conditions.teamUuid)) {
      indexName = 'teamUuid-index'
      keyName = 'teamUuid'
      keyValue = conditions.teamUuid
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
        items: (result.Items as unknown as ActivityAssignmentModel[]) ?? [],
        nextPage: result.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
          : undefined
      }
    }

    return await this.list(limit, cursor)
  }

  async findByUuid (uuid: string): Promise<ActivityAssignmentModel | undefined> {
    return await this.findBy({ uuid })
  }

  async findBy (conditions: Partial<ActivityAssignmentModel>): Promise<ActivityAssignmentModel | undefined> {
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
      return result.Items?.[0] as ActivityAssignmentModel | undefined
    }
    return undefined
  }

  async create (assignment: ActivityAssignmentModel): Promise<string | undefined> {
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

  async update ({ uuid }: ActivityAssignmentModel, data: Partial<ActivityAssignmentModel>): Promise<ActivityAssignmentModel | undefined> {
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

    return result.Attributes as ActivityAssignmentModel | undefined
  }

  async delete ({ uuid }: ActivityAssignmentModel): Promise<boolean> {
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

