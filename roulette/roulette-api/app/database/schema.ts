// schema.ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(), // Optional internal ID, not part of UserModel
  uuid: text('uuid').unique().notNull(), // external UUID
  phone: text('phone').unique().notNull(),
  username: text('username').unique().notNull(),
  fullname: text('fullname').notNull(),
  password: text('password'),
  otp: text('otp'),
  otpCount: integer('otp_count'),
  otpExpiresAt: integer('otp_expires_at'),
  lastSeen: integer('last_seen'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull(),
  isOnline: integer('is_online', { mode: 'boolean' }).notNull(),
  roles: text('roles'),
  teamUuid: text('team_uuid'),
  updatedAt: integer('updated_at').notNull(),
  createdAt: integer('created_at').notNull()
})

// Sessions table
export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey(),
  uuid: text('uuid').unique().notNull(),
  ip: text('ip').notNull(),
  userAgent: text('user_agent'),
  closedAt: integer('closed_at'),
  createdAt: integer('created_at').notNull(),
  expiresAt: integer('expires_at').notNull(),
  lastActivityAt: integer('last_activity_at').notNull(),
  userUuid: text('user_uuid')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' })
})

// Teams table
export const teams = sqliteTable('teams', {
  uuid: text('uuid').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  chatLink: text('chat_link'),
  totalMember: integer('total_member').notNull(),
  countMember: integer('count_member').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdAt: integer('created_at').notNull()
})

// Bets table
export const bets = sqliteTable('bets', {
  uuid: text('uuid').primaryKey(),
  value: text('value').notNull(),
  color: text('color').notNull(),
  userUuid: text('user_uuid')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  teamUuid: text('team_uuid')
    .notNull()
    .references(() => teams.uuid, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull()
})

export const badges = sqliteTable('badges', {
  id: integer('id').primaryKey(),
  uuid: text('uuid').unique().notNull(),
  authorUuid: text('author_uuid').notNull(), // lien vers users
  name: text('name').notNull(),
  color: text('color').notNull(),
  score: integer('score').notNull(),
  category: text('category').notNull(),
  categoryLabel: text('category_label').notNull(),
  description: text('description').notNull(),
  iconUrl: text('icon_url'),
  maxAssignments: integer('max_assignments').notNull(),
  visibility: text('visibility').notNull(), // 'public' | 'private'
  expirationDays: integer('expiration_days'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

export const badgeAssignments = sqliteTable('badge_assignments', {
  id: integer('id').primaryKey(),
  uuid: text('uuid').unique().notNull(),
  badgeUuid: text('badge_uuid').notNull(),
  teamUuid: text('team_uuid'),
  memberUuid: text('member_uuid'),
  comment: text('comment'),
  issuedByUuid: text('issued_by_uuid').notNull(),
  issuedAt: integer('issued_at').notNull(),
  origin: text('origin').notNull(), // 'manual' | 'system' | 'event'
  revoked: integer('revoked', { mode: 'boolean' }),
  revokedAt: integer('revoked_at'),
  revokedByUuid: text('revoked_by_uuid')
})


export const metadata = sqliteTable('metadata', {
  id: integer('id').primaryKey(),
  table: text('table').unique().notNull(),         // ex: 'badges'
  total: integer('total').notNull().default(0),
  deleted: integer('deleted').notNull().default(0),
  lastCreatedAt: integer('last_created_at'),
  lastUpdatedAt: integer('last_updated_at'),
  syncedAt: integer('synced_at'),
  lastUuid: text('last_uuid'),
  schemaVersion: text('schema_version').default('1.0')
})
