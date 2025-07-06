import {
  NotFoundError,
  HTTP_NOT_FOUND,
  HTTP_FORBIDDEN,
  ForbiddenError,
  BadRequestError,
  HTTP_BAD_REQUEST,
  HTTP_UNAUTHORIZED,
  UnauthorizedError,
  IncomingHttpEvent,
  HTTP_INTERNAL_SERVER_ERROR
} from '@stone-js/http-core'
import { RouteNotFoundError } from '@stone-js/router'
import { BadCredentialsError } from '../errors/CredentialsError'
import { ErrorHandler, IErrorHandler, ILogger, Promiseable } from '@stone-js/core'

/**
 * User Error Handler Options
 */
export interface SecurityErrorHandlerOptions {
  logger: ILogger
}

/**
 * User Error Handler
 */
@ErrorHandler({
  error: [
    'NotFoundError',
    'ForbiddenError',
    'BadRequestError',
    'UnauthorizedError',
    'RouteNotFoundError',
    'BadCredentialsError'
  ]
})
export class SecurityErrorHandler implements IErrorHandler<IncomingHttpEvent> {
  private readonly logger: ILogger

  /**
   * Create a new instance of SecurityErrorHandler
   *
   * @param logger
   */
  constructor ({ logger }: SecurityErrorHandlerOptions) {
    this.logger = logger
  }

  /**
   * Handle CredentialsError and UnauthorizedError
   *
   * @param error - The error to handle
   * @returns The response
   */
  handle (
    error:
    | NotFoundError
    | BadRequestError
    | UnauthorizedError
    | RouteNotFoundError
    | BadCredentialsError
  ): Promiseable<unknown> {
    this.logger.error(error.message)
    let message: string = 'An error occurred'
    let statusCode: number = HTTP_INTERNAL_SERVER_ERROR

    if (error instanceof NotFoundError || error instanceof RouteNotFoundError) {
      message = error.message
      statusCode = HTTP_NOT_FOUND
    } else if (error instanceof BadCredentialsError) {
      message = 'Invalid credentials'
      statusCode = HTTP_UNAUTHORIZED
    } else if (error instanceof UnauthorizedError) {
      statusCode = HTTP_UNAUTHORIZED
      message = 'You are not authorized to perform this action'
    } else if (error instanceof ForbiddenError) {
      statusCode = HTTP_FORBIDDEN
      message = 'You do not have permission to access this resource'
    } else if (error instanceof BadRequestError) {
      statusCode = HTTP_BAD_REQUEST
      message = error.message
    }

    return {
      statusCode,
      content: {
        errors: { message }
      }
    }
  }
}
