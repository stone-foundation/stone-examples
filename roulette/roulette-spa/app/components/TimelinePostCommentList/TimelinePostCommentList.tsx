import { fr } from 'date-fns/locale'
import { formatDistanceToNow } from 'date-fns'
import { PostComment } from '../../models/Post'

interface TimelinePostCommentListProps {
  comments: PostComment[]
}

export const TimelinePostCommentList = ({ comments }: TimelinePostCommentListProps) => {
  if (comments.length === 0) return null

  return (
    <div className="mt-4 space-y-3 px-1">
      {comments.map((comment) => (
        <div key={comment.uuid} className="flex gap-3 items-start">
          {comment.author.avatarUrl ? (
            <img
              src={comment.author.avatarUrl}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10" />
          )}

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
    </div>
  )
}
