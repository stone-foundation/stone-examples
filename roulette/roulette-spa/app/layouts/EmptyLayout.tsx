import { JSX } from 'react'
import { User } from '../models/User'
import { Footer } from '../components/Footer/Footer'
import { ChatProvider } from '../components/Chatbot/ChatProvider'
import { IPageLayout, PageLayoutRenderContext, PageLayout, StoneOutlet, ReactIncomingEvent } from '@stone-js/use-react'

/**
 * Empty Page layout component.
 */
@PageLayout({ name: 'empty' })
export class EmptyLayout implements IPageLayout {
  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ children, container }: PageLayoutRenderContext): JSX.Element {
    const user = container.make<ReactIncomingEvent>('event').getUser<User>()

    return (
      <div className="bg-[#0b2e36] text-white">
        <StoneOutlet>
          {children}
        </StoneOutlet>
        <Footer />
        {user?.isAdmin && <ChatProvider container={container} />}
      </div>
    )
  }
}
