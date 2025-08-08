import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { IBlueprint, isEmpty, Service } from '@stone-js/core'
import { MediaUploadUrlsPayload, MediaUploadUrlsResponse } from '../models/Media'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'

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

    const key = this.extractS3KeyFromUrl(publicUrl)
    const bucketName = this.blueprint.get<string>('aws.s3.bucketName', 'medias')

    const command = new DeleteObjectCommand({
      Key: key,
      Bucket: bucketName
    })

    await this.s3Client.send(command)
  }

  /**
   * Upload a file to S3
   * 
   * @param file - The file to upload
   * @param key - The key under which to store the file
   * @param contentType - The content type of the file
   */
  async uploadToS3 (file: Buffer | string, key: string, contentType: string): Promise<void> {
    const bucketName = this.blueprint.get<string>('aws.s3.bucketName', 'medias')

    const command = new PutObjectCommand({
      Key: key,
      Body: file,
      Bucket: bucketName,
      ContentType: contentType
    })

    await this.s3Client.send(command)
  }

  /**
   * Download a file from S3 given its public URL
   * 
   * @param publicUrl - The public URL of the file to download
   * @returns An object containing the file buffer and filename
   */
  async downloadFromS3 (publicUrl: string): Promise<{ buffer: Buffer, filename: string }> {
    const key = this.extractS3KeyFromUrl(publicUrl)
    const bucketName = this.blueprint.get<string>('aws.s3.bucketName', 'medias')

    const command = new GetObjectCommand({
      Key: key,
      Bucket: bucketName
    })

    const response = await this.s3Client.send(command)
    const data = await response.Body?.transformToByteArray()

    if (!data) throw new Error('Failed to download file from S3')

    return {
      buffer: Buffer.from(data),
      filename: key.split('/').pop() ?? 'audio.webm'
    }
  }

  /**
   * Download a file from S3 as a Readable stream given its public URL
   * 
   * @param publicUrl - The public URL of the file to download
   * @returns A Readable stream of the file
   */
  async downloadFromS3AsStream (publicUrl: string): Promise<Readable> {
    const buffer = await this.downloadFromS3(publicUrl)
    return this.bufferToStream(buffer.buffer, buffer.filename)
  }

  /**
   * Convert a Buffer to a Readable stream
   * 
   * @param buffer - The buffer to convert
   * @param filename - Optional filename to attach to the stream
   * @returns A Readable stream
   */
  bufferToStream(buffer: Buffer, filename?: string): Readable {
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)
    // @ts-ignore - attach filename to stream for later use if needed
    stream.path = filename
    return stream
  }

  /**
   * Extract the S3 key from a public URL
   * 
   * @param publicUrl - The public URL of the file
   * @returns The S3 key
   */
  private extractS3KeyFromUrl (publicUrl: string): string {
    const cloudfrontStaticUrl = this.blueprint.get<string>('aws.cloudfront.distStaticName', 'static')
    return publicUrl.replace(`${cloudfrontStaticUrl}/`, '')
  }
}
