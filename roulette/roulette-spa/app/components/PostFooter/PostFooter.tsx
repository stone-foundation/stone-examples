import { Logger } from '@stone-js/core'
import { Post } from '../../models/Post'
import { useContext, useState } from 'react'
import { StoneContext } from '@stone-js/use-react'
import { ThumbsUp, MessageCircle } from 'lucide-react'
import { PostService } from '../../services/PostService'

interface PostFooterProps {
  post: Post
}

export const PostFooter = ({ post }: PostFooterProps) => {
  const [isLiked, setIsLiked] = useState(post.likedByMe)
  const postService = useContext(StoneContext).container.resolve<PostService>(PostService)

  const onLike = () => {
    setIsLiked(!isLiked)
    post.likeCount += isLiked ? -1 : 1
    postService.toggleLike(post.uuid)
      .catch(error => {
        Logger.error('Failed to like post:', error)
      })
  }

  return (
    <div className="flex items-center gap-6 text-white/70 text-sm">
      <button
        onClick={onLike}
        className={`flex items-center gap-2 transition ${
          isLiked ? 'text-red-500 hover:text-red-700' : 'hover:text-white'
        }`}
      >
        <ThumbsUp size={16} />
        <span>{post.likeCount}</span>
      </button>

      <div className="flex items-center gap-2">
        <MessageCircle size={16} />
        <span>{post.commentCount}</span>
      </div>
    </div>
  )
}
