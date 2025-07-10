import { JSX } from 'react'
import { User } from '../../models/User'
import { Team } from '../../models/Team'
import { mockBadge, mockEvent } from '../../models/Post'
import { PageDetails } from '../../components/PageDetails/PageDetails'
import { RightSidebarPanel } from '../../components/RightSidebarPanel/RightSidebarPanel'
import { SingleTeamStatsPanel } from '../../components/SingleTeamStatsPanel/SingleTeamStatsPanel'
import { Page, ReactIncomingEvent, IPage, HeadContext, PageRenderContext } from '@stone-js/use-react'

/**
 * Team Page component.
 */
@Page('/page/:team@name/:tab?', { layout: 'app', rules: { team: /\w{0,32}/ } })
export class TeamPage implements IPage<ReactIncomingEvent> {
  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Opération Adrénaline - Timeline',
      description: 'Vivez l\'Opération Adrénaline avec la timeline interactive !',
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ event }: PageRenderContext): JSX.Element {
    const tab = event.get<string>('tab', 'timeline')
    // const team = event.get<Team>('team', {} as any)
    const team: Team = {
      name: 'Opération Adrénaline',
      color: 'blue',
      score: 100,
      rank: 1,
      motto: 'Unis pour la victoire',
      captain: { fullname: 'Alice Dupont', username: 'alice' } as any,
      rules: 'Respectez les règles du jeu.',
      slogan: 'Ensemble, nous sommes plus forts !',
      logoUrl: '/images/team-logo.png',
      chatLink: 'https://chat.example.com/team',
      bannerUrl: '/images/team-banner.jpg',
      totalMember: 50,
      countMember: 45,
      description: 'Rejoignez l\'Opération Adrénaline et participez à une aventure épique !',
      members: [],
    }
    const user = event.getUser<User>() ?? { username: 'Jonh', fullname: 'Doe' } as unknown as User

    return (
      <>
        <main className="flex-1 min-w-0">
          <PageDetails currentUser={user} team={team} activePath={tab} />
        </main>
        <aside className="w-full lg:w-64 shrink-0 hidden xl:block">
          <SingleTeamStatsPanel team={team} badges={[mockBadge]} events={[mockEvent]} />
          <RightSidebarPanel />
        </aside>
      </>
    )
  }
}
