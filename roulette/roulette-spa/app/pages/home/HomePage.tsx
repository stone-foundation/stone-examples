import { JSX } from 'react'
import { User } from '../../models/User'
import { Post } from '../../models/Post'
import { PostService } from '../../services/PostService'
import { TimelineFeed } from '../../components/TimelineFeed/TimelineFeed'
import { TimelineComposer } from '../../components/TimelineComposer/TimelineComposer'
import { RightSidebarPanel } from '../../components/RightSidebarPanel/RightSidebarPanel'
import { Page, ReactIncomingEvent, IPage, HeadContext, PageRenderContext } from '@stone-js/use-react'

/**
 * Home Page options.
 */
interface HomePageOptions {
  postService: PostService
}

/**
 * Home Page component.
 */
@Page('/', { layout: 'app', middleware: ['auth'] })
export class HomePage implements IPage<ReactIncomingEvent> {
  private readonly postService: PostService

  /**
   * Create a new Login Page component.
   */
  constructor ({ postService }: HomePageOptions) {
    this.postService = postService
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Tralala - Timeline',
      description: 'Vivez l\'Tralala avec la timeline interactive !',
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ event }: PageRenderContext): JSX.Element {
    const user = event.getUser<User>()

    return (
      <>
        <main className="flex-1 min-w-0">
          {user && <TimelineComposer currentUser={user} onPost={async (v, file) => await this.savePost(v, file)} />}
          <TimelineFeed currentUser={user} fetchPosts={async (user, v) => await this.postService.list(user, v)} />
        </main>
        <aside className="hidden xl:block w-64 shrink-0 sticky top-[80px] self-start h-[calc(100vh-80px)] overflow-y-auto">
          <RightSidebarPanel />
        </aside>
      </>
    )
  }

  async savePost (data: Partial<Post>, file?: File): Promise<void> {
    await this.postService.create(data, file)
  }
}
