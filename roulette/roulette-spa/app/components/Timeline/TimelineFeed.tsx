import { Post } from '../../models/Post'
import { User } from '../../models/User'
import { useEffect, useState } from 'react'
import { TimelinePostCard } from './TimelinePostCard'
import { ListMetadataOptions } from '../../models/App'
import InfiniteScroll from 'react-infinite-scroll-component'

interface TimelineFeedProps {
  currentUser?: User
  refreshTrigger?: number
  fetchPosts: (limit?: number, page?: string | number) => Promise<ListMetadataOptions<Post>>
}

export const TimelineFeed = ({ fetchPosts, currentUser, refreshTrigger }: TimelineFeedProps) => {
  const limit = 50
  const [hasMore, setHasMore] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [nextCursor, setNextCursor] = useState<string | number | undefined>()

  useEffect(() => {
    fetchInitial()
  }, [])

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchInitial()
    }
  }, [refreshTrigger])

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
          <TimelinePostCard key={post.uuid} post={post} currentUser={currentUser} />
        ))}
      </div>) : (
        <div className="text-white text-center py-4 border border-white/10 rounded-lg bg-white/5 mx-w-2xl mx-auto">
          Aucune publication pour le moment.
          <br />
          <br />
          Soyez le premier à publier !
        </div>
      )}
    </InfiniteScroll>
  )
}
