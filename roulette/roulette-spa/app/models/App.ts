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