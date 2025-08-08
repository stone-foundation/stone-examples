import { JSX } from 'react'
import { Footer } from '../components/Footer/Footer'
import { IPageLayout, PageLayoutRenderContext, PageLayout, StoneOutlet } from '@stone-js/use-react'

/**
 * Error Page layout component.
 */
@PageLayout({ name: 'error' })
export class ErrorLayout implements IPageLayout {
  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ children }: PageLayoutRenderContext): JSX.Element {
    return (
      <main className='min-h-screen bg-[#0b2e36] text-white flex flex-col justify-center items-center px-4'>
        <StoneOutlet>{children}</StoneOutlet>
        <Footer />
      </main>
    )
  }
}
