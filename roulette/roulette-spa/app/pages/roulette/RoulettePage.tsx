import { JSX } from 'react'
import { IBlueprint } from '@stone-js/core'
import { TeamService } from '../../services/TeamService'
import { Roulette } from '../../components/Roulette/Roulette'
import { RouletteService } from '../../services/RouletteService'
import { TeamMemberService } from '../../services/TeamMemberService'
import { Page, ReactIncomingEvent, IPage, HeadContext, PageRenderContext } from '@stone-js/use-react'

/**
 * Roulette Page options.
 */
interface RoulettePageOptions {
  blueprint: IBlueprint
  teamService: TeamService
  rouletteService: RouletteService
  teamMemberService: TeamMemberService
}

/**
 * Roulette Page component.
 */
@Page('/roulette', { layout: 'header', middleware: ['auth-mission'] })
export class RoulettePage implements IPage<ReactIncomingEvent> {
  private readonly blueprint: IBlueprint
  private readonly teamService: TeamService
  private readonly rouletteService: RouletteService
  private readonly teamMemberService: TeamMemberService

  /**
   * Create a new Roulette Page component.
   */
  constructor ({ blueprint, teamService, rouletteService, teamMemberService }: RoulettePageOptions) {
    this.blueprint = blueprint
    this.teamService = teamService
    this.rouletteService = rouletteService
    this.teamMemberService = teamMemberService
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Tralala - Accueil',
      description: 'Bienvenue sur la page d’accueil de Tralala. Découvrez votre équipe et leurs statistiques.'
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ event }: PageRenderContext): JSX.Element {
    return (
      <div className='flex flex-col sm:flex-row w-full max-w-7xl mx-auto gap-6 mt-10 px-4 transition-all duration-500 ease-in-out'>
        <Roulette
          event={event}
          blueprint={this.blueprint}
          teamService={this.teamService}
          rouletteService={this.rouletteService}
          teamMemberService={this.teamMemberService}
        />
      </div>
    )
  }
}
