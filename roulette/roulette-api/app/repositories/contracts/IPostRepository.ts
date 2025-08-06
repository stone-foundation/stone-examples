import { User } from '../../models/User'
import { PostModel } from '../../models/Post'
import { ListMetadataOptions } from '../../models/App'

/**
 * Post Repository contract
 */
export interface IPostRepository {
  /**
   * List all post models
   *
   * @param limit - Max number of posts
   * @param page - Pagination cursor or index
   */
  list: (limit?: number, page?: number | string) => Promise<ListMetadataOptions<PostModel>>

  /**
   * List posts filtered by conditions
   *
   * @param conditions - Fields to match
   * @param limit - Max number of results
   * @param page - Pagination cursor or index
   */
  listBy: (
    conditions: Partial<PostModel>,
    limit?: number,
    page?: number | string
  ) => Promise<ListMetadataOptions<PostModel>>

  /**
   * Find a post by UUID
   *
   * @param uuid - UUID of the post
   */
  findByUuid: (uuid: string) => Promise<PostModel | undefined>

  /**
   * Find one post matching the conditions
   *
   * @param conditions - Fields to match
   */
  findBy: (conditions: Partial<PostModel>) => Promise<PostModel | undefined>

  /**
   * Create a new post
   *
   * @param post - Post to persist
   * @param author - User creating the post
   * @returns UUID of created post
   */
  create: (post: PostModel, author: User) => Promise<string | undefined>

  /**
   * Update a post
   *
   * @param post - Existing post
   * @param data - Fields to update
   * @param author - User performing the update
   * @returns Updated post
   */
  update: (post: PostModel, data: Partial<PostModel>, author: User) => Promise<PostModel | undefined>

  /**
   * Delete a post
   *
   * @param post - Post to delete
   * @param author - User performing the deletion
   * @returns True if deleted
   */
  delete: (post: PostModel, author: User) => Promise<boolean>

  /**
   * Count total number of posts
   */
  count: () => Promise<number>
}
