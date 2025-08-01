import { Post } from '../../models/Post'
import { User } from '../../models/User'
import { useEffect, useState } from 'react'
import { ListMetadataOptions } from '../../models/App'
import InfiniteScroll from 'react-infinite-scroll-component'
import { TimelinePostCard } from '../TimelinePostCard/TimelinePostCard'

interface TimelineFeedProps {
  currentUser?: User
  fetchPosts: (limit?: number, page?: string | number) => Promise<ListMetadataOptions<Post>>
}

export const TimelineFeed = ({ fetchPosts, currentUser }: TimelineFeedProps) => {
  const limit = 50
  const [hasMore, setHasMore] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [nextCursor, setNextCursor] = useState<string | number | undefined>()

  useEffect(() => {
    fetchInitial()
  }, [])

  const fetchInitial = async () => {
    const res = await fetchPosts()
    setPosts(res.items)
    setNextCursor(res.nextPage)
    setHasMore(Boolean(res.nextPage))
  }

  const fetchMore = async () => {
    if (!nextCursor) return
    const res = await fetchPosts(limit, nextCursor)
    setPosts((prev) => [...prev, ...res.items])
    setNextCursor(res.nextPage)
    setHasMore(Boolean(res.nextPage))
  }

  const refresh = async () => {
    await fetchInitial()
  }

  return (
    <InfiniteScroll
      next={fetchMore}
      hasMore={hasMore}
      pullDownToRefresh
      dataLength={posts.length}
      refreshFunction={refresh}
      pullDownToRefreshThreshold={60}
      loader={<div className="text-white text-center py-4">Chargement...</div>}
      pullDownToRefreshContent={
        <h4 className="text-white text-center py-2">Tirez pour actualiser...</h4>
      }
      releaseToRefreshContent={
        <h4 className="text-white text-center py-2">Relâchez pour actualiser</h4>
      }
    >
      {posts.length > 0 ? (<div className="space-y-4">
        {posts.map((post) => (
          <TimelinePostCard key={post.id} post={post} currentUser={currentUser} />
        ))}
      </div>) : (
        <div className="text-white text-center py-4 border border-white/10 rounded-lg bg-white/5 mx-w-2xl mx-auto">
          Aucune publication pour le moment.
          <br />
          <br />
          Soiyez le premier à publier !
        </div>
      )}
    </InfiniteScroll>
  )
}
