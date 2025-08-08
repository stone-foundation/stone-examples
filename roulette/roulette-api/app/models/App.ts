/**
 * Twilio configuration interface.
 */
export interface TwilioConfig {
  accountSid: string
  authToken: string
  fromPhone: string // Your Twilio phone number
}

/**
 * Metadata table model interface.
 * Represents metadata about a specific table in the database.
 */
export interface MetadataModel {
  table: string
  total: number
  deleted: number
  syncedAt?: number | null
  lastUuid?: string | null
  lastCreatedAt?: number | null
  lastUpdatedAt?: number | null
  schemaVersion?: string | null
}

/**
 * Metadata interface.
 * Represents metadata with additional properties.
 */
export interface ListMetadataOptions<T> {
  items: T[]
  limit?: number
  total?: number
  page?: number | string
  nextPage?: string | number
}

/**
 * AI Analyzer response interface.
 * Represents the response from an AI analyzer service.
 */
export interface AIAnalyzerResponse {
  id: string
  tools: string[]
  memory: string
  prompt: string,
  summary?: string
  cancelled?: boolean
  requiresConfirmation?: boolean
}

/**
 * AI Executor response interface.
 * Represents the response from an AI executor service.
 */
export interface AIExecutorResponse {
  id: string
  memory: string
  message: string
}