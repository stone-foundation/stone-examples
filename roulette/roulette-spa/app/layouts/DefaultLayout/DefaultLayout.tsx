import { JSX } from 'react'
import { Footer } from '../../components/Footer/Footer'
import { HeaderBar } from '../../components/HeaderBar/HeaderBar'
import { IPageLayout, PageLayoutRenderContext, PageLayout, StoneOutlet } from '@stone-js/use-react'

/**
 * Default Page layout component.
 */
@PageLayout({ name: 'default' })
export class DefaultLayout implements IPageLayout {
  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ children, container }: PageLayoutRenderContext): JSX.Element {
    return (
      <main className='min-h-screen bg-[#0b2e36] text-white flex flex-col items-center px-4 pb-20'>
        <HeaderBar container={container} />
        <StoneOutlet className='flex flex-col sm:flex-row w-full max-w-7xl mx-auto gap-6 mt-10 px-4 transition-all duration-500 ease-in-out'>
          {children}
        </StoneOutlet>
        <Footer />
      </main>
    )
  }
}
