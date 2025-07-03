import { JSX } from 'react'
import { RouteNotFoundError } from '@stone-js/router'
import { defaultMessages, defaultTitles } from '../../constants'
import { ErrorPage, IErrorPage, ReactIncomingEvent, ErrorPageRenderContext, StoneLink, HeadContext, ErrorPageHeadContext } from '@stone-js/use-react'

/**
 * Default Error Handler component.
 */
@ErrorPage({
  layout: 'error',
  error: ['default', 'RouteNotFoundError']
})
export class DefaultErrorPage implements IErrorPage<ReactIncomingEvent> {
  handle (error: any): { statusCode: number, content: { title: string, message: string } } {
    const statusCode = error instanceof RouteNotFoundError ? 404 : error.statusCode ?? 500
    return {
      statusCode,
      content: { title: defaultTitles[statusCode], message: defaultMessages[statusCode] }
    }
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head ({ data, statusCode }: ErrorPageHeadContext): HeadContext {
    return {
      description: data.message,
      title: `Opération Adrénaline - Erreur ${statusCode}`
    }
  }

  /**
   * Render the component.
   *
   * @param options - The options for rendering the component.
   * @returns The rendered component.
   */
  render ({ data, statusCode }: ErrorPageRenderContext<Error>): JSX.Element {
    return (
      <div className='text-center space-y-6'>
        <div className='text-7xl font-bold text-orange-400'>{statusCode}</div>
        <h2 className='text-2xl font-semibold'>
          {data.title}
        </h2>
        <p className='text-sm text-white/70 max-w-md'>
          {data.message}
        </p>
        <StoneLink to='/' className='inline-block mt-6 px-6 py-2 border border-white/10 rounded-md text-white hover:bg-white/10 transition'>
          Retour à l’accueil
        </StoneLink>
      </div>
    )
  }
}
