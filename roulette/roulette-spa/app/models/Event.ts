import { Team } from "./Team"
import { User } from "./User"

export type EventType =
  | 'discipline'
  | 'punctuality'
  | 'teamwork'
  | 'leadership'
  | 'karting_win'
  | 'paintball_death'
  | 'captain_death'
  | 'squad_conquered'
  | 'squad_lost'
  | 'badge_awarded'
  | 'custom' // pour les arbitres

export interface Event extends EventModel {
  team: Team
  member?: User
  variant?: 'plus' | 'minus' // pour les disciplines
}

export interface EventModel {
  name: string
  uuid: string
  author: User
  score: number
  type: EventType
  typeLabel: string
  createdAt: number
  updatedAt?: number
  description: string
}