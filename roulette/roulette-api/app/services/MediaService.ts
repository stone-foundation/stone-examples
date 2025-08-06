import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { IBlueprint, isEmpty, Service } from '@stone-js/core'
import { MediaUploadUrlsPayload, MediaUploadUrlsResponse } from '../models/Media'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

/**
 * Media Service Options
*/
export interface MediaServiceOptions {
  s3Client: S3Client
  blueprint: IBlueprint
}

/**
 * Media Service
*/
@Service({ alias: 'mediaService' })
export class MediaService {
  private readonly s3Client: S3Client
  private readonly blueprint: IBlueprint

  /**
   * Create a new Media Service
  */
  constructor ({ blueprint, s3Client }: MediaServiceOptions) {
    this.blueprint = blueprint
    this.s3Client = s3Client
  }

  /**
   * Generate signed URLs for media upload
   * 
   * @param data - The media upload data
   * @param user - The user for whom the upload URL is generated
   * @returns An object containing the upload URL and public URL
   */
  async generateSignedUrl (data: MediaUploadUrlsPayload, user: User): Promise<MediaUploadUrlsResponse> {
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

  /**
   * Delete an object from S3 given its public URL
   * 
   * @param publicUrl - The public URL of the object to delete
   */
  async deleteS3Object (publicUrl: string | undefined | null): Promise<void> {
    if (isEmpty(publicUrl)) return

    const cloudfrontStaticUrl = this.blueprint.get<string>('aws.cloudfront.distStaticName', 'static')
    const key = publicUrl.replace(`${cloudfrontStaticUrl}/`, '')
    const bucketName = this.blueprint.get<string>('aws.s3.bucketName', 'medias')

    const command = new DeleteObjectCommand({
      Key: key,
      Bucket: bucketName
    })

    await this.s3Client.send(command)
  }
}
