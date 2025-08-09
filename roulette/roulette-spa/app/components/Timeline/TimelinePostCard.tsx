import { Logger } from "@stone-js/core"
import { User } from "../../models/User"
import { Post } from "../../models/Post"
import { useContext, useState } from "react"
import { StoneContext } from "@stone-js/use-react"
import { PostFooter } from "../PostFooter/PostFooter"
import { PostHeader } from "../PostHeader/PostHeader"
import { PostContent } from "../PostContent/PostContent"
import { PostCommentService } from "../../services/PostCommentService"
import { TimelinePostCommentList } from "./TimelinePostCommentList"
import { TimelinePostCommentInput } from "./TimelinePostCommentInput"


interface TimelinePostCardProps {
  post: Post
  currentUser?: User
}

export const TimelinePostCard = ({ post, currentUser }: TimelinePostCardProps) => {
  let nextPage: string = ''
  const [isLoading, setIsLoading] = useState(false)
  const [comments, setComments] = useState(post.comments ?? [])
  const commentService = useContext(StoneContext).container.resolve<PostCommentService>(PostCommentService)

  const showMoreComments = () => {
    if (isLoading) return
    setIsLoading(true)
    commentService
      .listByPost(post.uuid, 50, nextPage)
      .then((res) => {
        setComments((prev) => [...prev, ...res.items])
        nextPage = String(res.nextPage ?? '')
      })
      .catch((error) => {
        Logger.error("Failed to load more comments:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const onComment = (content: string) => {
    commentService
      .create({ postUuid: post.uuid, missionUuid: post.missionUuid, content })
      .then(() => {
        showMoreComments()
      })
      .catch((error) => {
        Logger.error("Failed to create comment:", error)
      })  
  }

  return (
    <div className="bg-neutral-900 rounded-xl mb-4 shadow border border-white/5 w-full transition hover:shadow-md hover:border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <PostHeader post={post} currentUser={currentUser} />
      </div>

      {/* Content */}
      <div className="p-4">
        <PostContent post={post} currentUser={currentUser} />
      </div>

      {/* Footer (like, comment, etc.) */}
      <div className="p-4 border-t border-white/5">
        <PostFooter post={post} />
      </div>

      {/* Comments section */}
      <div className="p-4 border-t border-white/5">
        <TimelinePostCommentInput
          onSubmit={onComment}
          currentUser={currentUser} 
        />
        <TimelinePostCommentList comments={comments} hasMore={post.commentCount > comments.length} isLoading={isLoading} onLoadMore={showMoreComments} />
      </div>
    </div>
  )
}
