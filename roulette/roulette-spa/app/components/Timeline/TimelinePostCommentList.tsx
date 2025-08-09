import { fr } from 'date-fns/locale'
import { Avatar } from '../Avatar/Avatar'
import { Spinner } from '../Spinner/Spinner'
import { formatDistanceToNow } from 'date-fns'
import { PostComment } from '../../models/Post'

interface TimelinePostCommentListProps {
  hasMore?: boolean
  isLoading?: boolean
  comments: PostComment[]
  onLoadMore?: () => void
}

export const TimelinePostCommentList = ({
  comments,
  onLoadMore,
  hasMore = false,
  isLoading = false
}: TimelinePostCommentListProps) => {
  if (comments.length === 0) return null

  return (
    <div className="mt-4 space-y-3 px-1">
      {comments.map((comment) => (
        <div key={comment.uuid} className="flex gap-3 items-start">
          <Avatar size={32} name={comment.author?.username ?? 'I'} imageUrl={comment.author?.avatarUrl} />
          <div className="flex-1 bg-white/5 rounded-lg px-4 py-2">
            <div className="flex justify-between items-center text-sm text-white/80 mb-1">
              <span className="font-medium">{comment.author.username}</span>
              <span className="text-xs text-white/40">
                {formatDistanceToNow(new Date(comment.createdAt), { locale: fr, addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-white">{comment.content}</p>
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            disabled={isLoading}
            onClick={onLoadMore}
            className="px-4 py-2 text-sm text-white rounded-md border border-white/10 bg-white/10 hover:bg-white/20 transition flex items-center gap-2"
          >
            {isLoading ? <Spinner /> : 'Charger plus de commentaires'}
          </button>
        </div>
      )}
    </div>
  )
}
