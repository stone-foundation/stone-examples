import { SecurityService } from '../services/SecurityService'
import { IMiddleware, Middleware, NextMiddleware } from '@stone-js/core'
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * Auth middleware Options
*/
export interface AuthOrNotMiddlewareOptions {
  securityService: SecurityService
}

/**
 * Auth middleware
 */
@Middleware({ alias: 'authOrNot', priority: 0 })
export class AuthOrNotMiddleware implements IMiddleware<IncomingHttpEvent, OutgoingHttpResponse> {
  private readonly securityService: SecurityService

  /**
   * Create a new instance of AuthOrNotMiddleware
   *
   * @param options - The options to create the middleware
   */
  constructor ({ securityService }: AuthOrNotMiddlewareOptions) {
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
    event: IncomingHttpEvent,
    next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>
  ): Promise<OutgoingHttpResponse> {
    const token = event.getHeader<string>('Authorization', '').replace('Bearer ', '')
    const user = await this.securityService.authenticateOrNot(token, event.ip, event.userAgent)

    event.setUserResolver(() => user)

    return await next(event)
  }
}
