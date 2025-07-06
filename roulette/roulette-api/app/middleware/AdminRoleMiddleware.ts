import { User } from '../models/User'
import { SecurityService } from '../services/SecurityService'
import { IMiddleware, Middleware, NextMiddleware } from '@stone-js/core'
import { ForbiddenError, IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * AdminRole Middleware Options
*/
export interface AdminRoleMiddlewareOptions {
  securityService: SecurityService
}

/**
 * AdminRole middleware
 */
@Middleware({ alias: 'admin', priority: 20 })
export class AdminRoleMiddleware implements IMiddleware<IncomingHttpEvent, OutgoingHttpResponse> {
  private readonly securityService: SecurityService

  /**
   * Create a new instance of AdminRole Middleware
   *
   * @param options - The options to create the middleware
   */
  constructor ({ securityService }: AdminRoleMiddlewareOptions) {
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

    if (!this.securityService.isAdmin(event.getUser<User>())) {
      throw new ForbiddenError('You do not have permission to access this resource')
    }

    return await next(event)
  }
}
