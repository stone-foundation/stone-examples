import { JSX } from 'react'
import { IBlueprint } from '@stone-js/core'
import { LoginForm } from '../../components/LoginForm/LoginForm'
import { SecurityService } from '../../services/SecurityService'
import { Page, ReactIncomingEvent, IPage, IRouter, HeadContext } from '@stone-js/use-react'

/**
 * Login Page options.
 */
interface LoginPageOptions {
  router: IRouter
  blueprint: IBlueprint
  securityService: SecurityService
}

/**
 * Login Page component.
 */
@Page('/login', { layout: 'security' })
export class LoginPage implements IPage<ReactIncomingEvent> {
  private readonly router: IRouter
  private readonly blueprint: IBlueprint
  private readonly securityService: SecurityService

  /**
   * Create a new Login Page component.
   */
  constructor ({ router, blueprint, securityService }: LoginPageOptions) {
    this.router = router
    this.blueprint = blueprint
    this.securityService = securityService
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    const url = this.blueprint.get('app.website.url', 'https://operation-adrenaline.com')

    return {
      title: 'Opération Adrénaline - Connexion',
      description: 'Connectez-vous pour participer à l’Opération Adrénaline. Entrez votre numéro de téléphone pour commencer.',
      metas: [
        { name: 'og:url', content: url },
        { name: 'og:type', content: 'website' },
        { name: 'og:image', content: '/logo.png' },
      ]
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
