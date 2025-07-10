import { JSX, useState } from 'react'
import { Team } from '../../models/Team'
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
      const teams = [
        { name: 'Alpha', color: 'blue', countMember: 5, totalMember: 10, score: 120 } as Team,
        { name: 'Bravo', color: 'red', countMember: 3, totalMember: 8, score: 95 } as Team,
        { name: 'Charlie', color: 'green', countMember: 4, totalMember: 6, score: 80 } as Team,
      ] as unknown as Team[]
    
      return (
        <div className="min-h-screen bg-[#0b2e36] text-white">
          <AppHeader container={container} onMenuToggle={() => setMenuOpen(true)} />
          <div className="mx-auto max-w-7xl px-4 sm:px-0 py-4 mt-2 flex">
            <aside className="w-full md:hidden lg:w-64 shrink-0">
              <SidebarDrawer
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                teams={teams}
              />
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
