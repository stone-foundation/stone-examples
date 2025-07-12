import { User } from './User'
import { Team } from './Team'
import { Badge } from './Badge'
import { Activity, ActivityAssignment } from './Activity'

export type PostType = 'text' | 'colored' | 'image' | 'activityAssignment' | string

export type PostVisibility = 'public' | 'team-only' | 'private' | string

export interface PostModel {
  uuid: string
  type: PostType
  content?: string | null
  teamUuid?: string | null
  imageUrl?: string | null
  authorUuid: string
  backgroundColor?: string | null
  activityAssignmentUuid?: string | null

  visibility: PostVisibility
  createdAt: number
  updatedAt: number

  likeCount: number
  likedByMe?: boolean | null
  commentCount: number

  likedByUuids?: unknown
}

export interface Post extends PostModel {
  team?: Team
  badge?: Badge
  author?: User
  activity?: Activity
  comments?: PostComment[]
  activityAssignment?: ActivityAssignment
}

export interface PostCommentModel {
  uuid: string
  content: string
  postUuid: string
  authorUuid: string

  createdAt: number
  updatedAt: number

  likeCount: number
  likedByMe?: boolean | null

  likedByUuids?: unknown
}

export interface PostComment extends PostCommentModel {
  author?: User
  post?: Post
}
