import { JSX } from 'react'
import { LoginForm } from '../../components/LoginForm/LoginForm'
import { SecurityService } from '../../services/SecurityService'
import { Page, ReactIncomingEvent, IPage, IRouter, HeadContext } from '@stone-js/use-react'

/**
 * Login Page options.
 */
interface LoginPageOptions {
  router: IRouter
  securityService: SecurityService
}

/**
 * Login Page component.
 */
@Page('/login', { layout: 'security', middleware: ['not-auth'] })
export class LoginPage implements IPage<ReactIncomingEvent> {
  private readonly router: IRouter
  private readonly securityService: SecurityService

  /**
   * Create a new Login Page component.
   */
  constructor ({ router, securityService }: LoginPageOptions) {
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
      title: 'Opération Adrénaline - Connexion',
      description: 'Connectez-vous pour participer à l’Opération Adrénaline. Entrez votre numéro de téléphone pour commencer.'
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render (): JSX.Element {
    return (
      <LoginForm
        securityService={this.securityService}
        onLogin={() => this.router.navigate('/')}
        onActivate={() => this.router.navigate('/password')}
      />
    )
  }
}
