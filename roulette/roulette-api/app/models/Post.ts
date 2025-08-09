import { User } from './User'
import { Team, TeamMember } from './Team'
import { ActivityAssignment } from './Activity'

export type PostVisibility = 'public' | 'team-only' | 'private'

export type PostType = 'text' | 'colored' | 'image' | 'activityAssignment' | 'team' | 'member' | 'mission'

export interface PostModel {
  uuid: string
  type: PostType
  content?: string | null
  teamUuid?: string | null
  imageUrl?: string | null
  authorUuid: string
  missionUuid: string
  teamMemberUuid?: string | null
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
  author?: User
  likedByMe?: boolean
  teamMember?: TeamMember
  comments?: PostComment[]
  activityAssignment?: ActivityAssignment
}

export interface PostCommentModel {
  uuid: string
  content: string
  postUuid: string
  authorUuid: string
  missionUuid: string

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
