import { JSX } from 'react'
import { User } from '../../models/User'
import { TimelineFeed } from '../../components/TimelineFeed/TimelineFeed'
import { TimelineComposer } from '../../components/TimelineComposer/TimelineComposer'
import { RightSidebarPanel } from '../../components/RightSidebarPanel/RightSidebarPanel'
import { Page, ReactIncomingEvent, IPage, HeadContext, PageRenderContext } from '@stone-js/use-react'

/**
 * Home Page component.
 */
@Page('/', { layout: 'app' })
export class HomePage implements IPage<ReactIncomingEvent> {
  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Opération Adrénaline - Timeline',
      description: 'Vivez l\'Opération Adrénaline avec la timeline interactive !',
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ event }: PageRenderContext): JSX.Element {
    const user = event.getUser<User>() ?? { username: 'Jonh', fullname: 'Doe' } as unknown as User

    return (
      <>
        <main className="flex-1 min-w-0">
          <TimelineComposer userName="Lolo" onPost={(v) => { console.log(v)}} />
          <TimelineFeed currentUser={user} fetchPosts={(): any => {}} />
        </main>
        <aside className="w-full lg:w-64 shrink-0 hidden xl:block sticky top-[80px] self-start h-[calc(100vh-80px)] overflow-y-auto">
          <RightSidebarPanel />
        </aside>
      </>
    )
  }
}
