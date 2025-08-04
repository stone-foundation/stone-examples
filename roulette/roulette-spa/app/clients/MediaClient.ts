import { Axios } from 'axios'
import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'
import { MediaUploadUrlsPayload, MediaUploadUrlsResponse } from '../models/Media'

/**
 * Media Client Options
 */
export interface MediaClientOptions {
  axios: Axios
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Media Client
 */
@Stone({ alias: 'mediaClient' })
export class MediaClient {
  private readonly axios: Axios
  private readonly path: string
  private readonly client: AxiosClient

  /**
   * Create a new Media Client
   *
   * @param options - The options to create the Media Client.
   */
  constructor ({ axios, blueprint, httpClient }: MediaClientOptions) {
    this.axios = axios
    this.client = httpClient
    this.path = blueprint.get('app.clients.media.path', '/medias')
  }

  /**
   * Generate upload URLs for media
   */
  async generateUploadUrls (payload: MediaUploadUrlsPayload): Promise<MediaUploadUrlsResponse> {
    return await this.client.post<MediaUploadUrlsResponse>(`${this.path}/signed-url`, payload)
  }

  /**
   * Upload a file to a signed S3 URL
   */
  async uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
    await this.axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } })
  }
}
