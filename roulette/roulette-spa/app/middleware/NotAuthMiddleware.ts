import { SecurityService } from '../services/SecurityService'
import { IMiddleware, Middleware, NextMiddleware } from '@stone-js/core'
import { ReactIncomingEvent, ReactOutgoingResponse, reactRedirectResponse } from '@stone-js/use-react'

/**
 * NotAuthMiddleware Options
*/
export interface NotAuthMiddlewareOptions {
  securityService: SecurityService
}

/**
 * NotAuthMiddleware
 */
@Middleware({ alias: 'not-auth' })
export class NotAuthMiddleware implements IMiddleware<ReactIncomingEvent, ReactOutgoingResponse> {
  private readonly securityService: SecurityService

  /**
   * Create a new instance of NotAuthMiddleware
   */
  constructor ({ securityService }: NotAuthMiddlewareOptions) {
    this.securityService = securityService
  }

  /**
   * Handle the incoming event
   *
   * @param event - The incoming event
   * @param next - The next middleware
   * @returns The response
   */
  async handle (
    event: ReactIncomingEvent,
    next: NextMiddleware<ReactIncomingEvent, ReactOutgoingResponse>
  ): Promise<ReactOutgoingResponse> {
    if (this.securityService.isAuthenticated()) {
      return reactRedirectResponse({ url: '/missions' })
    }

    return await next(event)
  }
}
