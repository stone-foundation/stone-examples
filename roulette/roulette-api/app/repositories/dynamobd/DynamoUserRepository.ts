import {
  PutCommand,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { UserModel } from '../../models/User'
import { IUserRepository } from '../contracts/IUserRepository'
import { IBlueprint, isEmpty, isNotEmpty } from '@stone-js/core'

/**
 * User Repository Options
 */
export interface DynamoUserRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
}

/**
 * User Repository
 */
export class DynamoUserRepository implements IUserRepository {
  private readonly tableName: string
  private readonly database: DynamoDBDocumentClient

  /**
   * Create a new instance of UserRepository
   */
  constructor ({ database, blueprint }: DynamoUserRepositoryOptions) {
    this.database = database
    this.tableName = blueprint.get('aws.dynamo.tables.users.name', 'users')
  }

  /**
   * List users
   *
   * @param limit - The limit of users to list
   * @returns The list of users
   */
  async list (limit: number): Promise<UserModel[]> {
    const result = await this.database.send(
      new ScanCommand({ TableName: this.tableName, Limit: Number(limit) })
    )
    return (result.Items as UserModel[]) ?? []
  }

  /**
   * List users by dynamic conditions
   *
   * @param conditions - Conditions to filter users
   * @param limit - The limit of users to list
   * @returns The list of users
   */
  async listBy (conditions: Partial<UserModel>, limit: number): Promise<UserModel[]> {
    if (isNotEmpty(conditions.teamUuid)) {
      const result = await this.database.send(
        new QueryCommand({
          Limit: Number(limit),
          TableName: this.tableName,
          IndexName: 'teamUuid-index',
          KeyConditionExpression: '#teamUuid = :teamUuid',
          ExpressionAttributeNames: { '#teamUuid': 'teamUuid' },
          ExpressionAttributeValues: { ':teamUuid': conditions.teamUuid }
        })
      )
      return (result.Items as UserModel[]) ?? []
    }

    // fallback to Scan if no indexed field is specified
    return await this.list(limit)
  }

  /**
   * Find a user by dynamic conditions
   *
   * @param conditions - Conditions to match the user
   * @returns The user or undefined if not found
   */
  async findBy (conditions: Partial<UserModel>): Promise<UserModel | undefined> {
    if (isNotEmpty(conditions.phone)) {
      const result = await this.database.send(
        new QueryCommand({
          Limit: 1,
          IndexName: 'phone-index',
          TableName: this.tableName,
          KeyConditionExpression: '#phone = :phone',
          ExpressionAttributeNames: { '#phone': 'phone' },
          ExpressionAttributeValues: { ':phone': conditions.phone }
        })
      )
      return result.Items?.[0] as UserModel | undefined
    }

    if (isNotEmpty(conditions.username)) {
      const result = await this.database.send(
        new QueryCommand({
          Limit: 1,
          TableName: this.tableName,
          IndexName: 'username-index',
          KeyConditionExpression: '#username = :username',
          ExpressionAttributeNames: { '#username': 'username' },
          ExpressionAttributeValues: { ':username': conditions.username }
        })
      )
      return result.Items?.[0] as UserModel | undefined
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
      return result.Items?.[0] as UserModel | undefined
    }

    return undefined
  }

  /**
   * Find a user by uuid
   *
   * @param uuid - The uuid of the user to find
   * @returns The user or undefined if not found
   */
  async findByUuid (uuid: string): Promise<UserModel | undefined> {
    return await this.findBy({ uuid })
  }

  /**
   * Create a user
   *
   * @param user - The user to create
   * @returns The uuid of the created user
   */
  async create (user: UserModel): Promise<string | undefined> {
    await this.database.send(
      new PutCommand({
        Item: user,
        TableName: this.tableName,
        ExpressionAttributeNames: { '#uuid': 'uuid' },
        ConditionExpression: 'attribute_not_exists(#uuid)'
      })
    )
    return user.uuid
  }

  /**
   * Update a user
   *
   * @param data - The user to update
   * @param data - The data to update in the user
   * @returns The updated user or undefined if not found
   */
  async update ({ uuid, username }: UserModel, data: Partial<UserModel>): Promise<UserModel | undefined> {
    const updateExprParts: string[] = []
    const exprAttrValues: Record<string, any> = {}
    const exprAttrNames: Record<string, string> = {}

    for (const [key, value] of Object.entries(data)) {
      if (['uuid', 'username'].includes(key) || isEmpty(value)) continue // skip immutable fields
      updateExprParts.push(`#${key} = :${key}`)
      exprAttrNames[`#${key}`] = key
      exprAttrValues[`:${key}`] = value
    }

    if (updateExprParts.length === 0) return await this.findByUuid(uuid)

    const result = await this.database.send(
      new UpdateCommand({
        Key: { uuid, username },
        ReturnValues: 'ALL_NEW',
        TableName: this.tableName,
        ExpressionAttributeNames: exprAttrNames,
        ExpressionAttributeValues: exprAttrValues,
        UpdateExpression: `SET ${updateExprParts.join(', ')}`
      })
    )

    return result.Attributes as UserModel | undefined
  }

  /**
   * Delete a user
   *
   * @param user - The user to delete
   * @returns `true` if the user was deleted, `false` if not
   */
  async delete ({ uuid, username }: UserModel): Promise<boolean> {
    try {
      await this.database.send(
        new DeleteCommand({
          Key: { uuid, username },
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
