import { User } from '../../models/User'
import { PostCommentModel } from '../../models/Post'
import { ListMetadataOptions } from '../../models/App'

/**
 * Post Comment Repository contract
 */
export interface IPostCommentRepository {
  /**
   * List all comments
   *
   * @param limit - Max number of comments
   * @param page - Pagination cursor or index
   */
  list: (limit?: number, page?: number | string) => Promise<ListMetadataOptions<PostCommentModel>>

  /**
   * List comments filtered by conditions
   *
   * @param conditions - Fields to match
   * @param limit - Max number of results
   * @param page - Pagination cursor or index
   */
  listBy: (
    conditions: Partial<PostCommentModel>,
    limit?: number,
    page?: number | string
  ) => Promise<ListMetadataOptions<PostCommentModel>>

  /**
   * Find a comment by UUID
   *
   * @param uuid - UUID of the comment
   */
  findByUuid: (uuid: string) => Promise<PostCommentModel | undefined>

  /**
   * Find one comment matching conditions
   *
   * @param conditions - Fields to match
   */
  findBy: (conditions: Partial<PostCommentModel>) => Promise<PostCommentModel | undefined>

  /**
   * Create a new comment
   *
   * @param comment - Comment to persist
   * @param author - User creating the comment
   * @returns UUID of created comment
   */
  create: (comment: PostCommentModel, author: User) => Promise<string | undefined>

  /**
   * Update a comment
   *
   * @param comment - Existing comment
   * @param data - Fields to update
   * @param author - User performing the update
   * @returns Updated comment
   */
  update: (comment: PostCommentModel, data: Partial<PostCommentModel>, author: User) => Promise<PostCommentModel | undefined>

  /**
   * Delete a comment
   *
   * @param comment - Comment to delete
   * @param author - User performing the deletion
   * @returns True if deleted
   */
  delete: (comment: PostCommentModel, author: User) => Promise<boolean>

  /**
   * Count total number of comments
   */
  count: () => Promise<number>
}
