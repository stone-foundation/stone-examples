import { User } from '../../models/User'
import { useEffect, useState } from 'react'
import { mockPosts } from '../../models/Post'
import InfiniteScroll from 'react-infinite-scroll-component'
import { TimelinePostCard } from '../TimelinePostCard/TimelinePostCard'

interface TimelineFeedProps {
  currentUser: User
  fetchPosts: (cursor?: string) => Promise<{ posts: any[], nextCursor?: string }>
}

export const TimelineFeed = ({ fetchPosts, currentUser }: TimelineFeedProps) => {
  const [hasMore, setHasMore] = useState(true)
  const [posts, setPosts] = useState<any[]>(mockPosts)
  const [nextCursor, setNextCursor] = useState<string | undefined>()

  useEffect(() => {
    // fetchInitial()
    
  }, [])

  const fetchInitial = async () => {
    const res = await fetchPosts()
    setPosts(res.posts)
    setNextCursor(res.nextCursor)
    setHasMore(Boolean(res.nextCursor))
  }

  const fetchMore = async () => {
    if (!nextCursor) return
    const res = await fetchPosts(nextCursor)
    setPosts((prev) => [...prev, ...res.posts])
    setNextCursor(res.nextCursor)
    setHasMore(Boolean(res.nextCursor))
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
      endMessage={<p className="text-white text-center py-4">Aucun autre post.</p>}
      pullDownToRefreshContent={
        <h4 className="text-white text-center py-2">Tirez pour actualiser...</h4>
      }
      releaseToRefreshContent={
        <h4 className="text-white text-center py-2">Relâchez pour actualiser</h4>
      }
    >
      <div className="space-y-4">
        {posts.map((post) => (
          <TimelinePostCard key={post.id} post={post} currentUser={currentUser} />
        ))}
      </div>
    </InfiniteScroll>
  )
}
