import { Team } from "./Team"
import { User } from "./User"
import { Mission } from "./Mission"
import { Post, PostComment } from "./Post"
import { Badge, BadgeAssignment } from "./Badge"
import { Activity, ActivityAssignment } from "./Activity"

export type ChatMessageRole = "user" | "assistant" | "system"

export interface ChatMessageModel {
  uuid: string
  content: string
  createdAt: number
  modelRef?: string | null
  audioUrl?: string | null
  authorUuid?: string | null
  steps?: unknown // Array of ChatMessageStepModel
  role: ChatMessageRole
}

export interface ChatMessageStepModel {
  content: string
  modelRef?: string
  postUuids?: string[]
  userUuids?: string[]
  teamUuids?: string[]
  badgeUuids?: string[]
  memberUuids?: string[]
  commentUuids?: string[]
  missionUuids?: string[]
  activityUuids?: string[]
  badgeAssignmentUuids?: string[]
  activityAssignmentUuids?: string[]
}

export interface ChatMessage extends ChatMessageModel {}

export interface ChatMessageStep extends ChatMessageStepModel {
  post?: Post[]
  users?: User[]
  teams?: Team[]
  badges?: Badge[]
  members?: User[]
  missions?: Mission[]
  activities?: Activity[]
  comments?: PostComment[]
  badgeAssignments?: BadgeAssignment[]
  activityAssignments?: ActivityAssignment[]
}