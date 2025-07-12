import { Post } from '../../models/Post'
import { User } from '../../models/User'
import { ThumbsUp, MessageCircle } from 'lucide-react'

interface PostFooterProps {
  post: Post
  currentUser?: User
  onLike?: () => void
  onComment?: () => void
}

export const PostFooter = ({
  post,
  onLike,
  onComment,
  currentUser,
}: PostFooterProps) => {
  const isLikedByCurrentUser = post.likedByUuids?.includes(currentUser?.uuid ?? '')

  return (
    <div className="flex items-center gap-6 text-white/70 text-sm">
      <button
        onClick={onLike}
        className='flex items-center gap-2 hover:text-white transition'
      >
        <ThumbsUp size={16} color={isLikedByCurrentUser ? 'red' : ''} />
        <span>{post.likeCount}</span>
      </button>

      <button
        onClick={onComment}
        className="flex items-center gap-2 hover:text-white transition"
      >
        <MessageCircle size={16} />
        <span>{post.commentCount}</span>
      </button>
    </div>
  )
}
