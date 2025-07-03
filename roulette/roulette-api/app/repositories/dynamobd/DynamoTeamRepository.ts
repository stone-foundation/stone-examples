import {
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { IBlueprint } from '@stone-js/core'
import { TeamModel } from '../../models/Team'
import { ITeamRepository } from '../contracts/ITeamRepository'

/**
 * Team Repository Options
 */
export interface DynamoTeamRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
}

/**
 * Team Repository
 */
export class DynamoTeamRepository implements ITeamRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient

  /**
   * Create a new instance of TeamRepository
   */
  constructor ({ database, blueprint }: DynamoTeamRepositoryOptions) {
    this.database = database
    this.tableName = blueprint.get('aws.dynamo.tables.teams.name', 'teams')
  }

  /**
   * List teams
   */
  async list (limit: number): Promise<TeamModel[]> {
    const result = await this.database.send(
      new ScanCommand({ TableName: this.tableName, Limit: limit })
    )
    return (result.Items as TeamModel[]) ?? []
  }

  /**
   * Find a team by UUID
   */
  async findByUuid (uuid: string): Promise<TeamModel | undefined> {
    const result = await this.database.send(
      new GetCommand({ TableName: this.tableName, Key: { uuid } })
    )
    return result.Item as TeamModel | undefined
  }

  /**
   * Find a team by dynamic conditions
   */
  async findBy (conditions: Partial<TeamModel>): Promise<TeamModel | undefined> {
    if (conditions.color !== undefined) {
      const result = await this.database.send(
        new QueryCommand({
          Limit: 1,
          IndexName: 'color-index',
          TableName: this.tableName,
          KeyConditionExpression: '#color = :color',
          ExpressionAttributeNames: { '#color': 'color' },
          ExpressionAttributeValues: { ':color': conditions.color }
        })
      )
      return result.Items?.[0] as TeamModel | undefined
    }

    if (conditions.name !== undefined) {
      const result = await this.database.send(
        new QueryCommand({
          Limit: 1,
          IndexName: 'name-index',
          TableName: this.tableName,
          KeyConditionExpression: '#name = :name',
          ExpressionAttributeNames: { '#name': 'name' },
          ExpressionAttributeValues: { ':name': conditions.name }
        })
      )
      return result.Items?.[0] as TeamModel | undefined
    }

    if (conditions.uuid !== undefined) {
      return await this.findByUuid(conditions.uuid)
    }

    return undefined
  }

  /**
   * Create a team
   */
  async create (team: TeamModel): Promise<string | undefined> {
    await this.database.send(
      new PutCommand({
        Item: team,
        TableName: this.tableName,
        ConditionExpression: 'attribute_not_exists(uuid)'
      })
    )
    return team.uuid
  }

  /**
   * Update a team
   */
  async update (uuid: string, team: Partial<TeamModel>): Promise<TeamModel | undefined> {
    const updateExprParts: string[] = []
    const exprAttrNames: Record<string, string> = {}
    const exprAttrValues: Record<string, any> = {}

    for (const [key, value] of Object.entries(team)) {
      updateExprParts.push(`#${key} = :${key}`)
      exprAttrNames[`#${key}`] = key
      exprAttrValues[`:${key}`] = value
    }

    if (updateExprParts.length === 0) return await this.findByUuid(uuid)

    const result = await this.database.send(
      new UpdateCommand({
        Key: { uuid },
        ReturnValues: 'ALL_NEW',
        TableName: this.tableName,
        ExpressionAttributeNames: exprAttrNames,
        ExpressionAttributeValues: exprAttrValues,
        UpdateExpression: `SET ${updateExprParts.join(', ')}`
      })
    )

    return result.Attributes as TeamModel | undefined
  }

  /**
   * Delete a team
   */
  async delete (uuid: string): Promise<boolean> {
    try {
      await this.database.send(
        new DeleteCommand({
          Key: { uuid },
          TableName: this.tableName,
          ConditionExpression: 'attribute_exists(uuid)'
        })
      )
      return true
    } catch (err: any) {
      if (err.name === 'ConditionalCheckFailedException') return false
      throw err
    }
  }
}
