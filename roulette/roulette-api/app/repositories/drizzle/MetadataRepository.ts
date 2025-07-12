import { eq } from 'drizzle-orm'
import { MetadataModel } from '../../models/App'
import { metadata } from '../../database/schema'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IMetadataRepository } from '../contracts/IMetadataRepository'

export interface MetadataRepositoryOptions {
  database: LibSQLDatabase
}

export class MetadataRepository implements IMetadataRepository {
  private readonly db: LibSQLDatabase

  constructor ({ database }: MetadataRepositoryOptions) {
    this.db = database
  }

  async get (table: string): Promise<MetadataModel | undefined> {
    const result = await this.db.select().from(metadata).where(eq(metadata.table, table)).get()
    return result ?? undefined
  }

  async increment (table: string, data: Partial<MetadataModel> = {}): Promise<void> {
    const existing = await this.get(table)

    if (existing != null) {
      await this.db.update(metadata).set({
        ...data,
        total: (existing.total ?? 0) + 1,
        lastUpdatedAt: Date.now()
      }).where(eq(metadata.table, table)).run()
    } else {
      await this.db.insert(metadata).values({
        ...data,
        table,
        total: 1,
        deleted: 0,
        lastCreatedAt: Date.now(),
        lastUpdatedAt: Date.now()
      }).run()
    }
  }

  async decrement (table: string, data: Partial<MetadataModel> = {}): Promise<void> {
    const existing = await this.get(table)

    if (existing != null) {
      await this.db.update(metadata).set({
        ...data,
        total: Math.max((existing.total ?? 1) - 1, 0),
        deleted: (existing.deleted ?? 0) + 1,
        lastUpdatedAt: Date.now()
      }).where(eq(metadata.table, table)).run()
    }
  }
}
