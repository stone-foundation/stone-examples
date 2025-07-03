import { JSX } from 'react'
import { Footer } from '../../components/Footer/Footer'
import { IPageLayout, PageLayoutRenderContext, PageLayout, StoneOutlet } from '@stone-js/use-react'

/**
 * Security Page layout component.
 */
@PageLayout({ name: 'security' })
export class SecurityLayout implements IPageLayout {
  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ children }: PageLayoutRenderContext): JSX.Element {
    return (
      <main className='min-h-screen bg-[#0b2e36] text-white flex flex-col justify-center items-center px-4'>
        <h1 className='text-5xl font-extrabold text-center text-white mb-8 tracking-wide'>
          OPÉRATION<br /> ADRÉNALINE
        </h1>
        <StoneOutlet className='w-full max-w-sm mx-auto'>{children}</StoneOutlet>
        <Footer />
      </main>
    )
  }
}
