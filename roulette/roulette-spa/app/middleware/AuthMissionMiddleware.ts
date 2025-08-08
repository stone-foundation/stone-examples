import { UserService } from '../services/UserService'
import { SecurityService } from '../services/SecurityService'
import { IMiddleware, Middleware, NextMiddleware } from '@stone-js/core'
import { ReactIncomingEvent, ReactOutgoingResponse, reactRedirectResponse } from '@stone-js/use-react'

/**
 * AuthMissionMiddleware Options
*/
export interface AuthMissionMiddlewareOptions {
  userService: UserService
  securityService: SecurityService
}

/**
 * AuthMissionMiddleware
 */
@Middleware({ alias: 'auth-mission' })
export class AuthMissionMiddleware implements IMiddleware<ReactIncomingEvent, ReactOutgoingResponse> {
  private readonly userService: UserService
  private readonly securityService: SecurityService

  /**
   * Create a new instance of AuthMissionMiddleware
   */
  constructor ({ userService, securityService }: AuthMissionMiddlewareOptions) {
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

    if (!event.cookies.has('mission') && event.path !== '/missions' && !user.isAdmin) {
      return reactRedirectResponse({ url: '/missions' })
    }

    if (!event.cookies.has('teamMember') && event.path !== '/roulette' && !user.isAdmin) {
      return reactRedirectResponse({ url: '/roulette' })
    }

    event.setUserResolver(() => user)

    return await next(event)
  }
}
