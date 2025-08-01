import { JSX, useState } from 'react'
import { Team } from '../../models/Team'
import { Footer } from '../../components/Footer/Footer'
import { AppHeader } from '../../components/AppHeader/AppHeader'
import { SidebarMenu } from '../../components/SidebarMenu/SidebarMenu'
import { SidebarDrawer } from '../../components/SidebarDrawer/SidebarDrawer'
import { IPageLayout, PageLayoutRenderContext, PageLayout, StoneOutlet } from '@stone-js/use-react'

/**
 * App Page layout component.
 */
@PageLayout({ name: 'app' })
export class AppLayout implements IPageLayout {
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
        <div className="mx-auto max-w-7xl px-4 sm:px-0 py-2 md:py-4 mt-2 flex flex-col lg:flex-row md:gap-6">
          <aside className="w-full lg:w-64 shrink-0">
            <SidebarDrawer
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
            />
            <div className="hidden md:block sticky top-[80px] self-start h-[calc(100vh-80px)] overflow-y-auto">
              <SidebarMenu />
            </div>
          </aside>

          <StoneOutlet className="flex-1 flex flex-col xl:flex-row gap-6 min-w-0">
            {children}
          </StoneOutlet>
        </div>
        <Footer />
      </div>
    )
  }
}
