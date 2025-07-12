import { Team } from "./Team"
import { User } from "./User"
import { Badge } from "./Badge"
import { Event } from "./Event"
import { Color } from "../constants"

export type PostVisibility = 'public' | 'team-only' | 'private'

export type PostType = 'text' | 'colored' | 'image' | 'event' | 'badge'

export interface Post {
  team?: Team
  uuid: string
  author: User
  event?: Event
  image?: File
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
  backgroundColor?: Color

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


// Mocked data for testing

const mockUser: User = {
  uuid: "user-1",
  fullname: "Alice",
  username: "alice123",
  avatarUrl: "https://example.com/avatar1.png",
  teamUuid: "team-1"
} as User

const mockTeam: Team = {
  uuid: "team-1",
  name: "Team Alpha",
  color: "red"
} as unknown as  Team

export const mockBadge: Badge = {
  uuid: "badge-1",
  score: 100,
  name: "Top Contributor",
  description: "Awarded for outstanding contributions",
} as Badge

export const mockEvent: Event = {
  uuid: "event-1",
  score: 50,
  type: "discipline",
  name: "Launch Party",
  typeLabel: "Launch",
  member: mockUser,
  variant: "minus",
  description: "Celebrating the launch of our new product",
  createdAt: 1718000000000
} as Event

export const mockPosts: Post[] = []

export const mockComments: PostComment[] = [
  {
    uuid: "comment-1",
    author: mockUser,
    content: "Nice post!",
    postUuid: "post-1",
    createdAt: 1718000100000,
    likeCount: 2
  },
  {
    uuid: "comment-2",
    author: mockUser,
    content: "Thanks for sharing.",
    postUuid: "post-1",
    createdAt: 1718000200000,
    likeCount: 1
  },
  {
    uuid: "comment-3",
    author: mockUser,
    content: "Great picture!",
    postUuid: "post-2",
    createdAt: 1718001100000,
    likeCount: 0
  }
]
