import { useState } from "react"
import { Post } from "../../models/Post"
import { User } from "../../models/User"
import { TimelineFeed } from "./TimelineFeed"
import { TimelineComposer } from "./TimelineComposer"
import { ListMetadataOptions } from "../../models/App"

interface TimelineProviderProps {
  user?: User
  savePost: (payload: Partial<Post>, file?: File) => Promise<void>
  fetchPosts: (limit?: number, page?: string | number) => Promise<ListMetadataOptions<Post>>
}

export const TimelineProvider = ({ user, savePost, fetchPosts }: TimelineProviderProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePostCreated = async (data: Partial<Post>, file?: File) => {
    await savePost(data, file)
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <>
      {user && (
        <TimelineComposer 
          currentUser={user} 
          onPost={handlePostCreated} 
        />
      )}
      <TimelineFeed 
        currentUser={user} 
        fetchPosts={fetchPosts}
        refreshTrigger={refreshTrigger}
      />
    </>
  )
}