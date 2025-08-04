import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { EventHandler, Post } from '@stone-js/router'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { MediaUploadUrlsPayload, MediaUploadUrlsResponse } from '../models/Media'
import { JsonHttpResponse, IncomingHttpEvent, BadRequestError } from '@stone-js/http-core'

/**
 * Media Event Handler Options
 */
export interface MediaEventHandlerOptions {
  s3Client: S3Client
  blueprint: IBlueprint
}

/**
 * Media Event Handler
 */
@EventHandler('/medias', { name: 'medias', middleware: ['auth'] })
export class MediaEventHandler {
  private readonly s3Client: S3Client
  private readonly blueprint: IBlueprint

  constructor ({ s3Client, blueprint }: MediaEventHandlerOptions) {
    this.s3Client = s3Client
    this.blueprint = blueprint
  }
  
  /**
   * Generate signed URL for media upload
   */
  @Post('/signed-url')
  @JsonHttpResponse(200)
  async generateSignedUrl (event: IncomingHttpEvent): Promise<MediaUploadUrlsResponse> {
    const user = event.getUser<User>()
    const data = event.getBody<MediaUploadUrlsPayload>()

    if (isEmpty(user) || isEmpty(data) || isEmpty(data.extension) || isEmpty(data.type) || isEmpty(data.group)) {
      throw new BadRequestError('User or data is missing')
    }

    return await this.generateUploadUrls(user, data)
  }

  /**
   * Generate upload URLs for user media
   *
   * @param user - The user for whom the upload URL is generated
   * @param extension - The file extension for the media
   * @returns An object containing the upload URL and public URL
   */
  private async generateUploadUrls (user: User, data: MediaUploadUrlsPayload): Promise<MediaUploadUrlsResponse> {
    const bucketName = this.blueprint.get<string>('aws.s3.bucketName', 'medias')
    const key = `medias/${user.uuid}/${data.group}/${randomUUID()}.${data.extension}`
    const expiresIn = this.blueprint.get<number>('aws.s3.signedUrlExpireSeconds', 300)
    const cloudfrontStaticUrl = this.blueprint.get<string>('aws.cloudfront.distStaticName', 'static')

    const command = new PutObjectCommand({
      Key: key,
      Bucket: bucketName,
      ContentType: data.type
    })

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn })

    const publicUrl = `${cloudfrontStaticUrl}/${key}`

    return { uploadUrl, publicUrl, key }
  }
}
