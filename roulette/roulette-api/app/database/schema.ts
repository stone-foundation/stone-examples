// schema.ts
import { sqliteTable, integer, text, numeric } from 'drizzle-orm/sqlite-core'

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
  roles: text('roles', { mode: 'json' }).default('[]'), // JSON array of roles
  teamUuid: text('team_uuid'),
  presenceActivityUuid: text('presence_activity_uuid'),
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
  rank: integer('rank').notNull().default(0),
  score: integer('score').notNull().default(0),
  color: text('color').notNull(),
  motto: text('motto'),
  rules: text('rules'),
  slogan: text('slogan'),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),
  description: text('description'),
  chatLink: text('chat_link'),
  captainUuid: text('captain_uuid'),
  totalMember: integer('total_member').notNull().default(0),
  countActivity: integer('count_activity').notNull().default(0),
  countBadges: integer('count_badges').notNull().default(0),
  countPresence: integer('count_presence').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
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
  revoked: integer('revoked', { mode: 'boolean' }).notNull().default(false),
  revokedAt: integer('revoked_at'),
  revokedByUuid: text('revoked_by_uuid')
})

export const metadata = sqliteTable('metadata', {
  id: integer('id').primaryKey(),
  table: text('table').unique().notNull(), // ex: 'badges'
  total: integer('total').notNull().default(0),
  deleted: integer('deleted').notNull().default(0),
  lastCreatedAt: integer('last_created_at'),
  lastUpdatedAt: integer('last_updated_at'),
  syncedAt: integer('synced_at'),
  lastUuid: text('last_uuid'),
  schemaVersion: text('schema_version').default('1.0')
})

export const activities = sqliteTable('activities', {
  uuid: text('uuid').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),

  category: text('category').notNull(),
  categoryLabel: text('category_label').notNull(),

  impact: text('impact', { enum: ['positive', 'negative', 'neutral'] }).notNull(),

  score: integer('score').notNull(),
  authorUuid: text('author_uuid').notNull(),

  badgeUuid: text('badge_uuid'),
  autoConvertToBadge: integer('auto_convert_to_badge', { mode: 'boolean' }).default(false),
  conversionThreshold: integer('conversion_threshold'),
  conversionWindow: text('conversion_window', { enum: ['team', 'member'] }),
  validityDuration: integer('validity_duration'),

  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

export const activityAssignments = sqliteTable('activity_assignments', {
  uuid: text('uuid').primaryKey(),
  activityUuid: text('activity_uuid').notNull(),

  teamUuid: text('team_uuid'),
  memberUuid: text('member_uuid'),

  badgeUuid: text('badge_uuid'),
  authorUuid: text('author_uuid').notNull(),
  origin: text('origin', { enum: ['system', 'manual'] }).notNull(),
  issuedAt: integer('issued_at').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'cancelled', 'contested', 'archived'] }).notNull(),

  // Location
  country: text('location_country'),
  city: text('location_city'),
  latitude: numeric('location_latitude'),
  longitude: numeric('location_longitude'),
  ip: text('location_ip'),
  region: text('location_region'),
  timezone: text('location_timezone'),
  continent: text('location_continent'),
  postalCode: text('location_postal_code'),
  isp: text('location_isp'),

  // Device info
  userAgent: text('user_agent'),
  device: text('device'),
  platform: text('platform'),
  ipAddress: text('ip_address'),

  // Extra
  comment: text('comment'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  validatedAt: integer('validated_at'),
  validatedByUuid: text('validated_by_uuid')
})

export const posts = sqliteTable('posts', {
  uuid: text('uuid').primaryKey(),
  type: text('type').notNull(), // 'text' | 'colored' | 'image' | 'event' | 'badge'
  content: text('content'),
  teamUuid: text('teamUuid'),
  imageUrl: text('imageUrl'),
  badgeUuid: text('badgeUuid'),
  eventUuid: text('activityUuid'),
  activityAssignmentUuid: text('activityAssignmentUuid'),
  authorUuid: text('authorUuid').notNull(),
  backgroundColor: text('backgroundColor'),
  visibility: text('visibility').notNull(), // 'private' | 'public'
  createdAt: integer('createdAt').notNull(),
  updatedAt: integer('updatedAt').notNull(),

  likeCount: integer('likeCount').notNull(),
  commentCount: integer('commentCount').notNull(),
  likedByUuids: text('likedByUuids', { mode: 'json' }) // array of strings
})

export const postComments = sqliteTable('postComments', {
  uuid: text('uuid').primaryKey(),
  content: text('content').notNull(),
  postUuid: text('postUuid').notNull(),
  authorUuid: text('authorUuid').notNull(),

  createdAt: integer('createdAt').notNull(),
  updatedAt: integer('updatedAt').notNull(),

  likeCount: integer('likeCount').notNull(),
  likedByUuids: text('likedByUuids', { mode: 'json' }) // array of strings
})
