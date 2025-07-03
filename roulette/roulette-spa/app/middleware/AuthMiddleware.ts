import { UserService } from '../services/UserService'
import { SecurityService } from '../services/SecurityService'
import { IMiddleware, Middleware, NextMiddleware } from '@stone-js/core'
import { ReactIncomingEvent, ReactOutgoingResponse, reactRedirectResponse } from '@stone-js/use-react'

/**
 * AuthMiddleware Options
*/
export interface AuthMiddlewareOptions {
  userService: UserService
  securityService: SecurityService
}

/**
 * AuthMiddleware
 */
@Middleware({ alias: 'auth' })
export class AuthMiddleware implements IMiddleware<ReactIncomingEvent, ReactOutgoingResponse> {
  private readonly userService: UserService
  private readonly securityService: SecurityService

  /**
   * Create a new instance of AuthMiddleware
   */
  constructor ({ userService, securityService }: AuthMiddlewareOptions) {
    this.userService = userService
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
    if (!this.securityService.isAuthenticated()) {
      return reactRedirectResponse({ url: '/login' })
    }

    const user = await this.userService.current(true)

    event.setUserResolver(() => user)

    return await next(event)
  }
}
