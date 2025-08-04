import { Team } from "./Team"
import { User } from "./User"
import { Badge } from "./Badge"
import { Color } from "../constants"
import { ActivityAssignment } from "./Activity"

export type PostVisibility = 'public' | 'team-only' | 'private'

export type PostType = 'text' | 'colored' | 'image' | 'activityAssignment'

export interface Post {
  team?: Team
  uuid: string
  author: User
  badge?: Badge
  type: PostType
  content?: string
  private: boolean
  imageUrl: string
  createdAt: number
  likeCount: number
  teamUuid?: string
  updatedAt?: number
  likedByMe?: boolean
  commentCount: number
  comments?: PostComment[]
  backgroundColor?: Color
  activityAssignment?: ActivityAssignment

  visibility: PostVisibility

  likedByUuids?: string[]
}

export interface PostComment {
  uuid: string
  author: User
  content: string
  postUuid: string
  createdAt: number
  likeCount: number
  likedByMe?: boolean
}
