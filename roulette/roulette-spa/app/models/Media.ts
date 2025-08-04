export interface MediaUploadUrlsPayload {
  type: string
  group: string
  extension: string
}

export interface MediaUploadUrlsResponse {
  key: string
  uploadUrl: string
  publicUrl: string
}