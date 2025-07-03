import {
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { BetModel } from '../../models/Bet'
import { IBlueprint } from '@stone-js/core'
import { IBetRepository } from '../contracts/IBetRepository'

/**
 * Bet Repository Options
 */
export interface DynamoBetRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
}

/**
 * Bet Repository
 */
export class DynamoBetRepository implements IBetRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient

  /**
   * Create a new instance of BetRepository
   */
  constructor ({ database, blueprint }: DynamoBetRepositoryOptions) {
    this.database = database
    this.tableName = blueprint.get('aws.dynamo.tables.bets.name', 'bets')
  }

  /**
   * List bets
   */
  async list (limit: number): Promise<BetModel[]> {
    const result = await this.database.send(
      new ScanCommand({ TableName: this.tableName, Limit: limit })
    )
    return (result.Items as BetModel[]) ?? []
  }

  /**
   * Find a bet by UUID
   */
  async findByUuid (uuid: string): Promise<BetModel | undefined> {
    const result = await this.database.send(
      new GetCommand({ TableName: this.tableName, Key: { uuid } })
    )
    return result.Item as BetModel | undefined
  }

  /**
   * Find a bet by dynamic conditions
   */
  async findBy (conditions: Partial<BetModel>): Promise<BetModel | undefined> {
    if (conditions.userUuid !== undefined) {
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
      return result.Items?.[0] as BetModel | undefined
    }

    if (conditions.teamUuid !== undefined) {
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
      return result.Items?.[0] as BetModel | undefined
    }

    if (conditions.uuid !== undefined) {
      return await this.findByUuid(conditions.uuid)
    }

    return undefined
  }

  /**
   * Create a bet
   */
  async create (bet: BetModel): Promise<string | undefined> {
    await this.database.send(
      new PutCommand({
        Item: bet,
        TableName: this.tableName,
        ConditionExpression: 'attribute_not_exists(uuid)'
      })
    )
    return bet.uuid
  }
}
