import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { SpinModel } from '../../models/Spin'
import { IBlueprint, isNotEmpty } from '@stone-js/core'
import { ISpinRepository } from '../contracts/ISpinRepository'

/**
 * Spin Repository Options
 */
export interface DynamoSpinRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
}

/**
 * Spin Repository
 */
export class DynamoSpinRepository implements ISpinRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient

  /**
   * Create a new instance of SpinRepository
   */
  constructor ({ database, blueprint }: DynamoSpinRepositoryOptions) {
    this.database = database
    this.tableName = blueprint.get('aws.dynamo.tables.spins.name', 'spins')
  }

  /**
   * List spins
   */
  async list (limit: number): Promise<SpinModel[]> {
    const result = await this.database.send(
      new ScanCommand({ TableName: this.tableName, Limit: Number(limit) })
    )
    return (result.Items as SpinModel[]) ?? []
  }

  /**
   * Find a spin by dynamic conditions
   */
  async findBy (conditions: Partial<SpinModel>): Promise<SpinModel | undefined> {
    if (isNotEmpty(conditions.userUuid)) {
      const result = await this.database.send(
        new QueryCommand({
          Limit: 1,
          TableName: this.tableName,
          IndexName: 'userUuid-index',
          KeyConditionExpression: '#userUuid = :userUuid',
          ExpressionAttributeNames: { '#userUuid': 'userUuid' },
          ExpressionAttributeValues: { ':userUuid': conditions.userUuid }
        })
      )
      return result.Items?.[0] as SpinModel | undefined
    }

    if (isNotEmpty(conditions.teamUuid)) {
      const result = await this.database.send(
        new QueryCommand({
          Limit: 1,
          TableName: this.tableName,
          IndexName: 'teamUuid-index',
          KeyConditionExpression: '#teamUuid = :teamUuid',
          ExpressionAttributeNames: { '#teamUuid': 'teamUuid' },
          ExpressionAttributeValues: { ':teamUuid': conditions.teamUuid }
        })
      )
      return result.Items?.[0] as SpinModel | undefined
    }

    if (isNotEmpty(conditions.uuid)) {
      const result = await this.database.send(
        new QueryCommand({
          Limit: 1,
          TableName: this.tableName,
          KeyConditionExpression: '#uuid = :uuid',
          ExpressionAttributeNames: { '#uuid': 'uuid' },
          ExpressionAttributeValues: { ':uuid': conditions.uuid }
        })
      )
      return result.Items?.[0] as SpinModel | undefined
    }

    return undefined
  }

  /**
   * Find a spin by UUID
   */
  async findByUuid (uuid: string): Promise<SpinModel | undefined> {
    return await this.findBy({ uuid })
  }

  /**
   * Create a spin
   */
  async create (spin: SpinModel): Promise<string | undefined> {
    await this.database.send(
      new PutCommand({
        Item: spin,
        TableName: this.tableName,
        ConditionExpression: 'attribute_not_exists(#uuid)',
        ExpressionAttributeNames: { '#uuid': 'uuid' }
      })
    )
    return spin.uuid
  }
}
