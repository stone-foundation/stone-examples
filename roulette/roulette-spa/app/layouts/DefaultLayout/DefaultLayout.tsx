import { JSX, useState } from 'react'
import { Footer } from '../../components/Footer/Footer'
import { AppHeader } from '../../components/AppHeader/AppHeader'
import { SidebarDrawer } from '../../components/SidebarDrawer/SidebarDrawer'
import { IPageLayout, PageLayoutRenderContext, PageLayout, StoneOutlet } from '@stone-js/use-react'

/**
 * Default Page layout component.
 */
@PageLayout({ name: 'private-default' })
export class DefaultLayout implements IPageLayout {
  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ children, container }: PageLayoutRenderContext): JSX.Element {
      const [menuOpen, setMenuOpen] = useState(false)
    
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
          <Footer />
        </div>
      )
    }
}
