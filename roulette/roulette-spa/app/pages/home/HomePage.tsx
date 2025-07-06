import { JSX } from 'react'
import { LandingPage } from '../../components/LandingPage/LandingPage'
import { Page, ReactIncomingEvent, IPage, HeadContext } from '@stone-js/use-react'

/**
 * Home Page component.
 */
@Page('/', { middleware: ['not-auth'] })
export class HomePage implements IPage<ReactIncomingEvent> {
  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Opération Adrénaline - Découvre ton unité',
      description: 'Tourne la roulette du destin et découvre ton unité. ESKE W PARE?'
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render (): JSX.Element {
    return <LandingPage />
  }
}
