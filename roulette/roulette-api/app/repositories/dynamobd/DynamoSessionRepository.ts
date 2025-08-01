import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { UserModel } from '../../models/User'
import { SessionModel } from '../../models/Session'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { ISessionRepository } from '../contracts/ISessionRepository'

/**
 * Session Session Repository Options
 */
export interface DynamoSessionRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
}

/**
 * Session Session Repository
 */
export class DynamoSessionRepository implements ISessionRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient

  /**
   * Create a new instance of SessionRepository
   */
  constructor ({ database, blueprint }: DynamoSessionRepositoryOptions) {
    this.database = database
    this.tableName = blueprint.get('aws.dynamo.tables.sessions.name', 'sessions')
  }

  /**
   * List sessions
   *
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  async list (limit: number): Promise<SessionModel[]> {
    const result = await this.database.send(
      new ScanCommand({
        Limit: Number(limit),
        TableName: this.tableName
      })
    )
    return (result.Items as SessionModel[]) ?? []
  }

  /**
   * List sessions
   *
   * @param limit - The limit of sessions to list
   * @returns The list of sessions
   */
  async listByUser (user: UserModel, limit: number): Promise<SessionModel[]> {
    const result = await this.database.send(
      new QueryCommand({
        Limit: Number(limit),
        TableName: this.tableName,
        IndexName: 'userUuid-index',
        KeyConditionExpression: '#userUuid = :userUuid',
        ExpressionAttributeNames: { '#userUuid': 'userUuid' },
        ExpressionAttributeValues: { ':userUuid': user.uuid },
        ScanIndexForward: false // DESC order by sort key (if you use createdAt as sort key in GSI)
      })
    )
    return (result.Items as SessionModel[]) ?? []
  }

  /**
   * Find a session by UUID
   *
   * @param uuid - The session UUID
   * @returns The session or undefined
   */
  async findByUuid (uuid: string): Promise<SessionModel | undefined> {
    const result = await this.database.send(
      new QueryCommand({
        Limit: 1,
        TableName: this.tableName,
        KeyConditionExpression: '#uuid = :uuid',
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ExpressionAttributeValues: { ':uuid': uuid }
      })
    )
    return result.Items?.[0] as SessionModel | undefined
  }

  /**
   * Retrieves the latest session for a given user.
   *
   * @param user - The user whose last session is being retrieved.
   * @returns The latest session or `undefined` if none exists.
   */
  async getLatest (user: UserModel): Promise<SessionModel | undefined> {
    const result = await this.database.send(
      new QueryCommand({
        Limit: 1,
        ScanIndexForward: false,
        TableName: this.tableName,
        IndexName: 'userUuid-index',
        KeyConditionExpression: '#userUuid = :userUuid',
        ExpressionAttributeNames: { '#userUuid': 'userUuid' },
        ExpressionAttributeValues: { ':userUuid': user.uuid }
      })
    )
    return result.Items?.[0] as SessionModel | undefined
  }

  /**
   * Create a session
   *
   * @param session - The session to create
   * @returns The ID of the created session
   */
  async create (session: SessionModel): Promise<SessionModel> {
    await this.database.send(
      new PutCommand({
        Item: session,
        TableName: this.tableName,
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ConditionExpression: 'attribute_not_exists(#uuid)'
      })
    )
    return session
  }

  /**
   * Update a session
   *
   * @param session - The session to update
   * @param data - The data to update in the session
   * @returns The updated session or undefined
   */
  async update ({ uuid, userUuid }: SessionModel, data: Partial<SessionModel>): Promise<SessionModel | undefined> {
    const updateExprParts: string[] = []
    const exprAttrNames: Record<string, string> = {}
    const exprAttrValues: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      if (['uuid', 'userUuid'].includes(key) && isEmpty(value)) continue // skip immutable fields
      updateExprParts.push(`#${key} = :${key}`)
      exprAttrNames[`#${key}`] = key
      exprAttrValues[`:${key}`] = value
    }

    if (updateExprParts.length === 0) return await this.findByUuid(uuid)

    const result = await this.database.send(
      new UpdateCommand({
        Key: { uuid, userUuid },
        ReturnValues: 'ALL_NEW',
        TableName: this.tableName,
        ExpressionAttributeNames: exprAttrNames,
        ExpressionAttributeValues: exprAttrValues,
        UpdateExpression: `SET ${updateExprParts.join(', ')}`
      })
    )

    return result.Attributes as SessionModel | undefined
  }

  /**
   * Delete a session
   *
   * @param session - The session to delete
   * @returns `true` if deleted, `false` otherwise
   */
  async delete ({ uuid, userUuid }: SessionModel): Promise<boolean> {
    try {
      await this.database.send(
        new DeleteCommand({
          Key: { uuid, userUuid },
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
