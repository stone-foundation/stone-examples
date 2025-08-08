import { JSX, useState } from 'react'
import { User } from '../models/User'
import { Footer } from '../components/Footer/Footer'
import { AppHeader } from '../components/AppHeader/AppHeader'
import { ChatProvider } from '../components/Chatbot/ChatProvider'
import { SidebarDrawer } from '../components/SidebarDrawer/SidebarDrawer'
import { IPageLayout, PageLayoutRenderContext, PageLayout, StoneOutlet, ReactIncomingEvent } from '@stone-js/use-react'

/**
 * Header Page layout component.
 */
@PageLayout({ name: 'header' })
export class HeaderLayout implements IPageLayout {
  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ children, container }: PageLayoutRenderContext): JSX.Element {
    const [menuOpen, setMenuOpen] = useState(false)
    const user = container.make<ReactIncomingEvent>('event').getUser<User>()
  
    return (
      <div className="min-h-screen bg-[#0b2e36] text-white">
        <AppHeader container={container} onMenuToggle={() => setMenuOpen(true)} />
        <div className="w-full min-h-screen px-4 py-0">
          <aside className="w-full md:hidden">
            <SidebarDrawer
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
            />
          </aside>

          <StoneOutlet className="flex-1 flex flex-col min-w-0">
            {children}
          </StoneOutlet>
        </div>
        {user?.isAdmin && <ChatProvider container={container} />}
        <Footer />
      </div>
    )
  }
}
