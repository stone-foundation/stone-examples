import { Post } from "../../models/Post"
import { User } from "../../models/User"
import { Avatar } from "../Avatar/Avatar"
import { COLOR_MAP } from "../../constants"
import { dateTimeFromNow } from "../../utils"
import { ShieldCheckIcon } from "lucide-react"

interface PostHeaderProps {
  post: Post
  currentUser: User
}

export const PostHeader = ({ post, currentUser }: PostHeaderProps) => {
  return (
    <div className="flex items-start justify-between w-full mb-2">
      <div className="flex items-center gap-3">
        <Avatar size={48} name={currentUser.username} imageUrl={currentUser.avatarUrl} />

        <div className="flex flex-col text-white gap-3">
          <span className="font-semibold leading-none capitalize">
            {currentUser.isAdmin && <span>{currentUser.isAdmin && post.author.fullname} - @</span>}
            <span>{post.author.username}</span>
            {post.author.isModerator && (
              <ShieldCheckIcon size={14} className="inline-block ml-1 text-orange-400" />
            )}
          </span>

          <div className="text-sm text-white/60">
            {post.team?.name && post.team?.color && (
              <span
                className="inline-block items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-medium bg-white/10"
                style={{ border: `2px solid ${COLOR_MAP[post.team?.color]}` }}
              >
                {post.team?.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <span className="text-xs text-white/40 whitespace-nowrap">{dateTimeFromNow(post.createdAt)}</span>
    </div>
  )
}
