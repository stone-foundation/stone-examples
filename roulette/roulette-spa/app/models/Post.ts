import { Team } from "./Team"
import { User } from "./User"
import { Badge } from "./Badge"
import { Event } from "./Event"
import { Color } from "../constants"

export type PostType = 'text' | 'colored' | 'image' | 'event' | 'badge'

export interface Post {
  team?: Team
  uuid: string
  author: User
  event?: Event
  badge?: Badge
  type: PostType
  content?: string
  private: boolean
  image?: ImagePost
  createdAt: number
  likeCount: number
  updatedAt?: number
  likedByMe?: boolean
  commentCount: number
  backgroundColor?: Color
}

export interface ImagePost {
  imageUrl: string
  caption?: string
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

export const mockPosts: Post[] = [
  {
    uuid: "post-1",
    author: mockUser,
    team: mockTeam,
    type: "text",
    content: "Hello world!",
    private: false,
    createdAt: 1718000000000,
    likeCount: 5,
    commentCount: 2
  },
  {
    uuid: "post-1-1",
    author: mockUser,
    team: mockTeam,
    type: "colored",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    private: false,
    createdAt: 1718000000000,
    backgroundColor: "blue",
    likeCount: 5,
    commentCount: 2
  },
  {
    uuid: "post-2",
    author: mockUser,
    type: "image",
    image: {
      imageUrl: "/karting.jpg",
      caption: "A beautiful day"
    },
    private: false,
    createdAt: 1718001000000,
    likeCount: 3,
    commentCount: 1
  },
  {
    uuid: "post-3",
    author: mockUser,
    type: "badge",
    badge: mockBadge,
    team: mockTeam,
    private: true,
    createdAt: 1718002000000,
    likeCount: 1,
    commentCount: 0
  },
  {
    uuid: "post-4",
    author: mockUser,
    type: "event",
    team: mockTeam,
    event: mockEvent,
    private: false,
    createdAt: 1718003000000,
    likeCount: 0,
    commentCount: 0
  }
]

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
