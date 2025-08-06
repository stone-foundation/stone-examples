import { JSX } from 'react'
import { RouteNotFoundError } from '@stone-js/router'
import { TokenService } from '../../services/TokenService'
import { ForbiddenError } from '../../errors/ForbiddenError'
import { defaultMessages, defaultTitles } from '../../constants'
import { UnauthorizedError } from '../../errors/UnauthorizedError'
import { ErrorPage, IErrorPage, ReactIncomingEvent, ErrorPageRenderContext, StoneLink, HeadContext, ErrorPageHeadContext } from '@stone-js/use-react'

/**
 * Options for the DefaultErrorPage.
 */
export interface IDefaultErrorPageOptions {
  tokenService: TokenService
}

/**
 * Default Error Handler component.
 */
@ErrorPage({
  layout: 'error',
  error: ['default', 'RouteNotFoundError', 'UnauthorizedError', 'ForbiddenError']
})
export class DefaultErrorPage implements IErrorPage<ReactIncomingEvent> {
  private readonly tokenService: TokenService

  /**
   * Create a new DefaultErrorPage component.
   *
   * @param options - The options for the DefaultErrorPage.
   */
  constructor ({ tokenService }: IDefaultErrorPageOptions) {
    this.tokenService = tokenService
  }

  /**
   * Handle the incoming error and return a standardized error response.
   *
   * @param error - The error to handle.
   * @returns An object containing the status code and content for the error page.
   */
  handle (error: any): { statusCode: number, content: { title: string, message: string } } {
    let statusCode = error.statusCode ?? 500

    if (error instanceof RouteNotFoundError) {
      statusCode = 404
    } else if (error instanceof UnauthorizedError) {
      statusCode = 401
      this.tokenService.removeToken()
    } else if (error instanceof ForbiddenError) {
      statusCode = 403
    }

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
      title: `Tralala - Erreur ${String(statusCode)}`
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
