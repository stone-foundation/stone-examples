import { JSX } from 'react'
import { IBlueprint } from '@stone-js/core'
import { TeamService } from '../../services/TeamService'
import { Roulette } from '../../components/Roulette/Roulette'
import { RouletteService } from '../../services/RouletteService'
import { Page, ReactIncomingEvent, IPage, HeadContext } from '@stone-js/use-react'

/**
 * Spin Page options.
 */
interface SpinPageOptions {
  blueprint: IBlueprint
  teamService: TeamService
  rouletteService: RouletteService
}

/**
 * Spin Page component.
 */
@Page('/spin', { layout: 'private-default', middleware: ['auth'] })
export class SpinPage implements IPage<ReactIncomingEvent> {
  private readonly blueprint: IBlueprint
  private readonly teamService: TeamService
  private readonly rouletteService: RouletteService

  /**
   * Create a new Login Page component.
   */
  constructor ({ blueprint, teamService, rouletteService }: SpinPageOptions) {
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
    return (
      <div className='flex flex-col sm:flex-row w-full max-w-7xl mx-auto gap-6 mt-10 px-4 transition-all duration-500 ease-in-out'>
        <Roulette blueprint={this.blueprint} teamService={this.teamService} rouletteService={this.rouletteService} />
      </div>
    )
  }
}
