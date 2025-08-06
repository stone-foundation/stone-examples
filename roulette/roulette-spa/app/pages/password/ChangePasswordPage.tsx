import { JSX } from 'react'
import { SecurityService } from '../../services/SecurityService'
import { ChangePasswordForm } from '../../components/Security/ChangePasswordForm'
import { Page, ReactIncomingEvent, IPage, IRouter, HeadContext } from '@stone-js/use-react'

/**
 * ChangePassword Page options.
 */
interface ChangePasswordPageOptions {
  router: IRouter
  securityService: SecurityService
}

/**
 * ChangePassword Page component.
 */
@Page('/password', { layout: 'security', middleware: ['auth'] })
export class ChangePasswordPage implements IPage<ReactIncomingEvent> {
  private readonly router: IRouter
  private readonly securityService: SecurityService

  /**
   * Create a new Login Page component.
   */
  constructor ({ router, securityService }: ChangePasswordPageOptions) {
    this.router = router
    this.securityService = securityService
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Tralala - Password',
      description: 'Ajoutez un mot de passe pour votre compte.'
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render (): JSX.Element {
    return <ChangePasswordForm securityService={this.securityService} onChange={() => this.router.navigate('/spin')} />
  }
}
