export interface Mission {
  uuid: string
  name: string
  endDate?: number
  createdAt: number
  updatedAt: number
  imageUrl?: string
  startDate?: number
  description: string
  visibility: 'public' | 'private'
}
