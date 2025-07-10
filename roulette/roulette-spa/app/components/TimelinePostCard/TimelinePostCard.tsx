import { User } from "../../models/User"
import { Post } from "../../models/Post"
import { PostFooter } from "../PostFooter/PostFooter"
import { PostHeader } from "../PostHeader/PostHeader"
import { PostContent } from "../PostContent/PostContent"
import { TimelinePostCommentList } from "../TimelinePostCommentList/TimelinePostCommentList"
import { TimelinePostCommentInput } from "../TimelinePostCommentInput/TimelinePostCommentInput"


interface TimelinePostCardProps {
  post: Post
  currentUser: User
}

export const TimelinePostCard = ({ post, currentUser }: TimelinePostCardProps) => {
  return (
    <div className="bg-neutral-900 rounded-xl mb-6 shadow border border-white/5 w-full transition hover:shadow-md hover:border-white/10">
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
        <PostFooter post={post} currentUser={currentUser} />
      </div>

      {/* Comments section */}
      <div className="p-4 border-t border-white/5">
        <TimelinePostCommentInput
          onSubmit={(comment) => {
            console.log("New comment:", comment)
          }}
          currentUser={currentUser} 
        />
        <TimelinePostCommentList comments={[]} />
      </div>
    </div>
  )
}
