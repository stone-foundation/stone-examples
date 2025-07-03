import { JSX } from 'react'
import { IBlueprint } from '@stone-js/core'
import { TeamService } from '../../services/TeamService'
import { Roulette } from '../../components/Roulette/Roulette'
import { RouletteService } from '../../services/RouletteService'
import { Page, ReactIncomingEvent, IPage, HeadContext } from '@stone-js/use-react'

/**
 * Home Page options.
 */
interface HomePageOptions {
  blueprint: IBlueprint
  teamService: TeamService
  rouletteService: RouletteService
}

/**
 * Home Page component.
 */
@Page('/', { middleware: ['auth'] })
export class HomePage implements IPage<ReactIncomingEvent> {
  private readonly blueprint: IBlueprint
  private readonly teamService: TeamService
  private readonly rouletteService: RouletteService

  /**
   * Create a new Login Page component.
   */
  constructor ({ blueprint, teamService, rouletteService }: HomePageOptions) {
    this.blueprint = blueprint
    this.teamService = teamService
    this.rouletteService = rouletteService
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Opération Adrénaline - Accueil',
      description: 'Bienvenue sur la page d’accueil de l’Opération Adrénaline. Découvrez votre équipe et leurs statistiques.'
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render (): JSX.Element {
    return <Roulette blueprint={this.blueprint} teamService={this.teamService} rouletteService={this.rouletteService} />
  }
}
