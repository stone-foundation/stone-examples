import { Axios } from 'axios'
import { AxiosClient } from './AxiosClient'
import { Team, TeamStat } from '../models/Team'
import { IBlueprint, Stone } from '@stone-js/core'

/**
 * Team Client Options
 */
export interface TeamClientOptions {
  axios: Axios
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Team Client
 */
@Stone({ alias: 'teamClient' })
export class TeamClient {
  private readonly axios: Axios
  private readonly path: string
  private readonly client: AxiosClient

  /**
   * Create a new Team Client
   *
   * @param options - The options to create the Team Client.
   */
  constructor ({ axios, blueprint, httpClient }: TeamClientOptions) {
    this.axios = axios
    this.client = httpClient
    this.path = blueprint.get('app.clients.team.path', '/teams')
  }
  
  /**
   * List all posts
   */
  async list (limit: number = 10, page?: string | number): Promise<Team[]> {
    const query = new URLSearchParams({ limit: String(limit), page: String(page ?? '') })
    return await this.client.get(`${this.path}/?${query.toString()}`)
  }

  /**
   * Get a badge by name
   */
  async getByName (name: string): Promise<Team> {
    return await this.client.get<Team>(`${this.path}/by-name/${name}`)
  }

  /**
   * Get the team results
   *
   * @returns The team results
   */
  async results (): Promise<TeamStat[]> {
    return await this.client.get<TeamStat[]>(`${this.path}/results`)
  }

  /**
   * Get the current team
   *
   * @returns The current team
   */
  async currentTeam (): Promise<Team> {
    return await this.client.get<Team>(`${this.path}/me`)
  }

  /**
   * Update an existing team
   */
  async update (uuid: string, data: Partial<Team>): Promise<Team> {
    return await this.client.patch<Team>(`${this.path}/${uuid}`, data)
  }

  /**
   * Upload a logo for a team
   */
  async generateUploadLink (uuid: string, type: 'logo' | 'banner'): Promise<{ uploadUrl: string, publicUrl: string }> {
    return await this.client.post<{ uploadUrl: string, publicUrl: string }>(`${this.path}/${uuid}/upload`, { type })
  }

  /**
   * Upload a file to a signed S3 URL
   */
  async uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
    await this.axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } })
  }
}
