import { sqliteTable, integer, text, numeric } from 'drizzle-orm/sqlite-core'

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }), // Optional internal ID, not part of UserModel
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
  updatedAt: integer('updated_at').notNull(),
  createdAt: integer('created_at').notNull(),
})

// Sessions table
export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  ip: text('ip').notNull(),
  userAgent: text('user_agent'),
  closedAt: integer('closed_at'),
  createdAt: integer('created_at').notNull(),
  expiresAt: integer('expires_at').notNull(),
  lastActivityAt: integer('last_activity_at').notNull(),
  userUuid: text('user_uuid').notNull().references(() => users.uuid, { onDelete: 'cascade' })
})

// Teams table
export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  name: text('name').unique().notNull(),
  rank: integer('rank').notNull().default(0),
  score: integer('score').notNull().default(0),
  color: text('color'),
  motto: text('motto'),
  rules: text('rules'),
  slogan: text('slogan'),
  logoUrl: text('logo_url'),
  chatLink: text('chat_link'),
  bannerUrl: text('banner_url'),
  description: text('description'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  countBadges: integer('count_badges').notNull().default(0),
  totalMembers: integer('total_members').notNull().default(0),
  countMembers: integer('count_members').notNull().default(0),
  countPresences: integer('count_presences').notNull().default(0),
  countActivities: integer('count_activities').notNull().default(0),
  captainUuid: text('captain_uuid').references(() => users.uuid, { onDelete: 'set null' }),
  missionUuid: text('mission_uuid').notNull().references(() => missions.uuid, { onDelete: 'cascade' }),
})

// TeamMembers table
export const teamMembers = sqliteTable('team_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  userUuid: text('user_uuid').notNull().references(() => users.uuid, { onDelete: 'cascade' }),
  teamUuid: text('team_uuid').notNull().references(() => teams.uuid, { onDelete: 'cascade' }),
  role: text('role', { enum: ['member', 'captain', 'admin'] }).notNull(),
  joinedAt: integer('joined_at').notNull(),
  leftAt: integer('left_at'),
  name: text('name').unique().notNull(),
  isLate: integer('is_late', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isPresent: integer('is_present', { mode: 'boolean' }).notNull().default(false),
  missionUuid: text('mission_uuid').notNull().references(() => missions.uuid, { onDelete: 'cascade' }),
})

// Spins table
export const spins = sqliteTable('spins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  value: text('value').notNull(),
  color: text('color'),
  userUuid: text('user_uuid')
    .notNull()
    .references(() => users.uuid, { onDelete: 'cascade' }),
  teamUuid: text('team_uuid')
    .notNull()
    .references(() => teams.uuid, { onDelete: 'cascade' }),
  teamMemberUuid: text('team_member_uuid')
    .notNull()
    .references(() => teamMembers.uuid, { onDelete: 'cascade' }),
  missionUuid: text('mission_uuid')
    .notNull()
    .references(() => missions.uuid, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull()
})

export const badges = sqliteTable('badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  score: integer('score').notNull(),
  category: text('category').notNull(),
  categoryLabel: text('category_label').notNull(),
  description: text('description').notNull(),
  iconUrl: text('icon_url'),
  expirationDays: integer('expiration_days'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  maxAssignments: integer('max_assignments').notNull(),
  visibility: text('visibility', { enum: ['public', 'private'] }).notNull(),
  missionUuid: text('mission_uuid').notNull().references(() => missions.uuid, { onDelete: 'cascade' }),
})

export const badgeAssignments = sqliteTable('badge_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  comment: text('comment'),
  revokedAt: integer('revoked_at'),
  issuedAt: integer('issued_at').notNull(),
  revoked: integer('revoked', { mode: 'boolean' }).notNull().default(false),
  origin: text('origin', { enum: ['manual', 'system', 'event'] }).notNull(),
  teamUuid: text('team_uuid').references(() => teams.uuid, { onDelete: 'cascade' }),
  revokedByUuid: text('revoked_by_uuid').references(() => users.uuid, { onDelete: 'cascade' }),
  badgeUuid: text('badge_uuid').notNull().references(() => badges.uuid, { onDelete: 'cascade' }),
  teamMemberUuid: text('team_member_uuid').references(() => teamMembers.uuid, { onDelete: 'cascade' }),
  missionUuid: text('mission_uuid').notNull().references(() => missions.uuid, { onDelete: 'cascade' }),
  issuedByUuid: text('issued_by_uuid').notNull().references(() => users.uuid, { onDelete: 'cascade' }),
})

export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),

  category: text('category').notNull(),
  categoryLabel: text('category_label').notNull(),

  impact: text('impact', { enum: ['positive', 'negative', 'neutral'] }).notNull(),

  score: integer('score').notNull(),

  autoConvertToBadge: integer('auto_convert_to_badge', { mode: 'boolean' }).default(false),
  conversionThreshold: integer('conversion_threshold'),
  conversionWindow: text('conversion_window', { enum: ['team', 'member'] }),
  validityDuration: integer('validity_duration'),
  
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  badgeUuid: text('badge_uuid').references(() => badges.uuid, { onDelete: 'set null' }),
  missionUuid: text('mission_uuid').notNull().references(() => missions.uuid, { onDelete: 'cascade' }),
})

export const activityAssignments = sqliteTable('activity_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  activityUuid: text('activity_uuid').notNull().references(() => activities.uuid, { onDelete: 'cascade' }),

  teamUuid: text('team_uuid').references(() => teams.uuid, { onDelete: 'cascade' }),
  teamMemberUuid: text('team_member_uuid').references(() => teamMembers.uuid, { onDelete: 'cascade' }),

  badgeUuid: text('badge_uuid').references(() => badges.uuid, { onDelete: 'set null' }),
  issuedByUuid: text('issued_by_uuid').notNull().references(() => users.uuid, { onDelete: 'cascade' }),
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
  validatedByUuid: text('validated_by_uuid').references(() => users.uuid, { onDelete: 'set null' }),
  missionUuid: text('mission_uuid').notNull().references(() => missions.uuid, { onDelete: 'cascade' }),
})

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  type: text('type', { enum: ['text', 'colored', 'image', 'activityAssignment', 'team', 'member', 'mission'] }).notNull(),
  content: text('content'),
  imageUrl: text('imageUrl'),
  backgroundColor: text('backgroundColor'),
  visibility: text('visibility', { enum: ['public', 'private', 'team-only'] }).notNull(),

  createdAt: integer('createdAt').notNull(),
  updatedAt: integer('updatedAt').notNull(),
  
  likeCount: integer('likeCount').notNull(),
  commentCount: integer('commentCount').notNull(),
  likedByUuids: text('likedByUuids', { mode: 'json' }), // array of strings
  
  teamUuid: text('teamUuid').references(() => teams.uuid, { onDelete: 'set null' }),
  teamMemberUuid: text('teamMemberUuid').references(() => users.uuid, { onDelete: 'set null' }),
  authorUuid: text('authorUuid').notNull().references(() => users.uuid, { onDelete: 'cascade' }),
  missionUuid: text('mission_uuid').notNull().references(() => missions.uuid, { onDelete: 'cascade' }),
  badgeAssignmentUuid: text('badgeAssignmentUuid').references(() => badgeAssignments.uuid, { onDelete: 'set null' }),
  activityAssignmentUuid: text('activityAssignmentUuid').references(() => activityAssignments.uuid, { onDelete: 'set null' }),
})

export const postComments = sqliteTable('postComments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  content: text('content').notNull(),
  postUuid: text('postUuid').notNull(),
  authorUuid: text('authorUuid').notNull(),

  createdAt: integer('createdAt').notNull(),
  updatedAt: integer('updatedAt').notNull(),

  likeCount: integer('likeCount').notNull(),
  likedByUuids: text('likedByUuids', { mode: 'json' }), // array of strings
  missionUuid: text('mission_uuid').notNull().references(() => missions.uuid, { onDelete: 'cascade' }),
})

export const missions = sqliteTable('missions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  endDate: integer('end_date'),
  location: text('location'),
  openDate: integer('open_date'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  imageUrl: text('image_url'),
  startDate: integer('start_date'),
  description: text('description').notNull(),
  visibility: text('visibility', { enum: ['public', 'private'] }).notNull()
})

export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  content: text('content').notNull(),
  memory: text('memory'),
  modelRef: text('model_ref'),
  audioUrl: text('audio_url'),
  createdAt: integer('created_at').notNull(),
  steps: text('steps', { mode: 'json' }), // JSON array of ChatMessageStepModel
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  authorUuid: text('author_uuid').references(() => users.uuid, { onDelete: 'set null' }),
})

export const userHistories = sqliteTable('user_histories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').unique().notNull(),
  itemUuid: text('item_uuid').notNull(),
  createdAt: integer('created_at').notNull(),
  action: text('action', { enum: ['created', 'updated', 'deleted'] }).notNull(),
  authorUuid: text('author_uuid').notNull().references(() => users.uuid),
  type: text('type', { enum: ['user', 'team', 'post', 'badge', 'mission', 'activity', 'team_member', 'post_comment', 'badge_assignment', 'activity_assignment'] }).notNull(),
})

export const metadata = sqliteTable('metadata', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  table: text('table').unique().notNull(), // ex: 'badges'
  total: integer('total').notNull().default(0),
  deleted: integer('deleted').notNull().default(0),
  lastCreatedAt: integer('last_created_at'),
  lastUpdatedAt: integer('last_updated_at'),
  syncedAt: integer('synced_at'),
  lastUuid: text('last_uuid'),
  schemaVersion: text('schema_version').default('1.0')
})