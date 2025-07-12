import { User } from '../models/User'
import { SecurityService } from '../services/SecurityService'
import { IMiddleware, Middleware, NextMiddleware } from '@stone-js/core'
import { ForbiddenError, IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * CaptainRole Middleware Options
*/
export interface CaptainRoleMiddlewareOptions {
  securityService: SecurityService
}

/**
 * CaptainRole middleware
 */
@Middleware({ alias: 'captain', priority: 20 })
export class CaptainRoleMiddleware implements IMiddleware<IncomingHttpEvent, OutgoingHttpResponse> {
  private readonly securityService: SecurityService

  /**
   * Create a new instance of CaptainRole Middleware
   *
   * @param options - The options to create the middleware
   */
  constructor ({ securityService }: CaptainRoleMiddlewareOptions) {
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
    const user = await this.securityService.authenticate(token, event.ip, event.userAgent)

    event.setUserResolver(() => user)

    if (!this.securityService.isAdmin(event.getUser<User>()) && !this.securityService.hasRole(event.getUser<User>(), 'captain')) {
      throw new ForbiddenError('You do not have permission to access this resource')
    }

    return await next(event)
  }
}
