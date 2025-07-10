import clsx from "clsx"
import { User } from "../../models/User"
import { Post } from "../../models/Post"
import { COLOR_MAP } from "../../constants"

interface PostContentProps {
  post: Post
  currentUser: User
}

export const PostContent = ({ post, currentUser }: PostContentProps) => {
  if (post.type === "image" && post.image?.imageUrl) {
    return (
      <div className="rounded-lg overflow-hidden border border-white/5 mt-2">
        <img src={post.image.imageUrl} alt="Contenu du post" className="w-full h-auto object-cover" />
      </div>
    )
  }

  if (post.type === "colored" && post.backgroundColor) {
    return (
      <div
        className="flex items-center justify-center rounded-xl mt-2"
        style={{
          minHeight: "160px",
          padding: "32px 16px",
          backgroundColor: COLOR_MAP[post.backgroundColor],
        }}
      >
        <span
          className="text-white text-2xl md:text-3xl font-bold text-center w-full break-words"
          style={{
            maxWidth: "90%",
            lineHeight: 1.2,
            wordBreak: "break-word",
            letterSpacing: "0.01em",
            textShadow: "0 2px 8px rgba(0,0,0,0.25)"
          }}
        >
          {post.content}
        </span>
      </div>
    )
  }

  // future case: type === "event"
  if (post.type === "event" && post.event) {
    return (
      <div className="bg-gradient-to-br overflow-hidden from-white/5 to-white/10 border border-white/10 rounded-xl p-4 mt-2 text-white shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-lg font-semibold text-orange-400">{post.event.name}</h4>
          {post.event.score !== undefined && (
            <span className={clsx(
                'text-sm px-3 py-1 rounded-full font-bold shadow-inner',
                post.event.variant === 'plus' ? 'bg-green-600/80' : '',
                post.event.variant === 'minus' ? 'bg-red-600/80' : ''
              )}
            >
              {post.event.variant === 'plus' ? '+' : ''}
              {post.event.variant === 'minus' ? '-' : ''}
              {post.event.score} pts
            </span>
          )}
        </div>

        {post.event.description && (
          <p className="text-sm text-white/80 leading-snug mb-2">
            {post.event.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
          {post.team?.color && (
            <span
              className="px-3 py-1 text-xs font-semibold rounded-full capitalize"
              style={{ backgroundColor: COLOR_MAP[post.team.color] }}
            >
              {post.team.name}
            </span>
          )}
          {post.event.type && (
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md">
              🎯 {post.event.typeLabel}
            </span>
          )}
          {post.event.member && (
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md">
              👤 {currentUser.isAdmin && `${post.event.member.username} - @`}{post.event.member.username}
            </span>
          )}
        </div>
      </div>
    )
  }

  if (post.type === 'badge' && post.badge) {
    return (
      <div className="p-4 overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-white/10 shadow-md text-white flex flex-col md:flex-row items-center gap-4">
        <div>
          {post.badge.iconUrl
            ? (<img src={post.badge.iconUrl} alt={post.badge.name} className="w-12 h-12 md:w-16 md:h-16 object-contain" />)
            : (<span className="text-5xl md:text-6xl text-orange-400">🏅</span>)
          }
        </div>

        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-semibold mb-1">
            Badge attribué à <span className="font-bold text-white">{post.team?.name ?? 'Équipe inconnue'}</span>
          </h3>
          <p className="text-base font-bold text-orange-400">{post.badge.name}</p>
          {post.badge.score && <p className="text-md font-bold text-orange-100 mt-1">{post.badge.score} pts</p>}
          {post.badge.description && <p className="text-sm text-white/80 mt-1">{post.badge.description}</p>}
        </div>

        {post.team?.color && (
          <span
            className="px-3 py-1 text-xs font-semibold rounded-full capitalize"
            style={{ backgroundColor: COLOR_MAP[post.team.color] }}
          >
            {post.team.name}
          </span>
        )}
      </div>
    )
  }


  // default: simple text
  return (
    <article className="text-white text-sm mt-2 whitespace-pre-line leading-relaxed">{post.content}</article>
  )
}
