import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { TeamModel } from '../../models/Team'
import { ITeamRepository } from '../contracts/ITeamRepository'
import { IBlueprint, isEmpty, isNotEmpty } from '@stone-js/core'

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
      new ScanCommand({ TableName: this.tableName, Limit: Number(limit) })
    )
    return (result.Items as TeamModel[]) ?? []
  }

  /**
   * Find a team by dynamic conditions
   */
  async findBy (conditions: Partial<TeamModel>): Promise<TeamModel | undefined> {
    if (isNotEmpty(conditions.color)) {
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

    if (isNotEmpty(conditions.name)) {
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
      return result.Items?.[0] as TeamModel | undefined
    }

    return undefined
  }

  /**
   * Find a team by UUID
   *
   * @param uuid - The UUID of the team to find
   * @returns The team or undefined if not found
   */
  async findByUuid (uuid: string): Promise<TeamModel | undefined> {
    return await this.findBy({ uuid })
  }

  /**
   * Create a team
   */
  async create (team: TeamModel): Promise<string | undefined> {
    await this.database.send(
      new PutCommand({
        Item: team,
        TableName: this.tableName,
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ConditionExpression: 'attribute_not_exists(#uuid)'
      })
    )
    return team.uuid
  }

  /**
   * Update a team
   *
   * @param team - The team to update
   * @param data - The data to update in the team
   * @returns The updated team or undefined if not found
   */
  async update ({ uuid, name }: TeamModel, data: Partial<TeamModel>): Promise<TeamModel | undefined> {
    const updateExprParts: string[] = []
    const exprAttrValues: Record<string, any> = {}
    const exprAttrNames: Record<string, string> = {}

    for (const [key, value] of Object.entries(data)) {
      if (['uuid', 'name'].includes(key) && isEmpty(value)) continue // skip immutable fields
      updateExprParts.push(`#${key} = :${key}`)
      exprAttrNames[`#${key}`] = key
      exprAttrValues[`:${key}`] = value
    }

    if (updateExprParts.length === 0) return await this.findByUuid(uuid)

    const result = await this.database.send(
      new UpdateCommand({
        Key: { uuid, name },
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
   *
   * @param team - The team to delete
   * @returns `true` if the team was deleted, `false` if not
   */
  async delete ({ uuid, name }: TeamModel): Promise<boolean> {
    try {
      await this.database.send(
        new DeleteCommand({
          Key: { uuid, name },
          TableName: this.tableName,
          ExpressionAttributeNames: { '#uuid': 'uuid' },
          ConditionExpression: 'attribute_exists(#uuid)'
        })
      )
      return true
    } catch (err: any) {
      if (err.name === 'ConditionalCheckFailedException') return false
      throw err
    }
  }
}
