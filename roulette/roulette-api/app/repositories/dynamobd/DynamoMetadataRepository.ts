import {
  QueryCommand,
  UpdateCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { IBlueprint } from '@stone-js/core'
import { MetadataModel } from '../../models/App'
import { IMetadataRepository } from '../contracts/IMetadataRepository'

export interface DynamoMetadataRepositoryOptions {
  blueprint: IBlueprint
  database: DynamoDBDocumentClient
}

export class DynamoMetadataRepository implements IMetadataRepository {
  private readonly db: DynamoDBDocumentClient
  private readonly tableName: string

  constructor ({ database, blueprint }: DynamoMetadataRepositoryOptions) {
    this.db = database
    this.tableName = blueprint.get('aws.dynamo.tables.metadata.name', 'metadata')
  }

  async get (table: string): Promise<MetadataModel | undefined> {
    const result = await this.db.send(new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: '#table = :table',
      ExpressionAttributeNames: { '#table': 'table' },
      ExpressionAttributeValues: { ':table': table },
      Limit: 1
    }))
    return result.Items?.[0] as MetadataModel | undefined
  }

  async increment (table: string, data: Partial<MetadataModel> = {}): Promise<void> {
    await this.db.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { table },
      ExpressionAttributeNames: {
        '#total': 'total',
        '#deleted': 'deleted',
        '#lastUpdatedAt': 'lastUpdatedAt',
        '#lastCreatedAt': 'lastCreatedAt',
        '#lastUuid': 'lastUuid'
      },
      ExpressionAttributeValues: {
        ':inc1': 1,
        ':zero': 0,
        ':now': Date.now(),
        ':uuid': data.lastUuid ?? null
      },
      UpdateExpression: `
        SET #total = if_not_exists(#total, :zero) + :inc1,
            #deleted = if_not_exists(#deleted, :zero),
            #lastUpdatedAt = :now,
            #lastCreatedAt = :now,
            #lastUuid = :uuid
      `
    }))
  }

  async decrement (table: string, data: Partial<MetadataModel> = {}): Promise<void> {
    await this.db.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { table },
      ExpressionAttributeNames: {
        '#total': 'total',
        '#deleted': 'deleted',
        '#lastUpdatedAt': 'lastUpdatedAt'
      },
      ExpressionAttributeValues: {
        ':inc1': 1,
        ':dec1': 1,
        ':zero': 0,
        ':now': Date.now()
      },
      UpdateExpression: `
        SET #total = if_not_exists(#total, :zero) - :dec1,
            #deleted = if_not_exists(#deleted, :zero) + :inc1,
            #lastUpdatedAt = :now
      `
    }))
  }
}
