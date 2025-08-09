export interface MissionModel {
  uuid: string
  name: string
  code: string
  createdAt: number
  updatedAt: number
  description: string
  location?: string | null
  openDate?: number | null
  endDate?: number | null
  imageUrl?: string | null
  startDate?: number | null
  visibility: 'public' | 'private'
}

export interface Mission extends MissionModel {}
