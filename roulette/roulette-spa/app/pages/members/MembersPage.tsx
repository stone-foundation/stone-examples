import { JSX } from 'react'
import { Mission } from '../../models/Mission'
import { TeamMember } from '../../models/Team'
import { ListMetadataOptions } from '../../models/App'
import { MemberList } from '../../components/MemberList/MemberList'
import { TeamMemberService } from '../../services/TeamMemberService'
import { Page, ReactIncomingEvent, IPage, HeadContext, PageRenderContext } from '@stone-js/use-react'

/**
 * Members Page options.
 */
interface MembersPageOptions {
  teamMemberService: TeamMemberService
}

/**
 * Members Page component.
 */
@Page('/members', { layout: 'header', middleware: ['auth-mission'] })
export class MembersPage implements IPage<ReactIncomingEvent> {
  private readonly teamMemberService: TeamMemberService

  /**
   * Create a new Login Page component.
   */
  constructor ({ teamMemberService }: MembersPageOptions) {
    this.teamMemberService = teamMemberService
  }

  /**
   * Handle the incoming event and fetch the list of users.
   *
   * @param event - The incoming event containing query parameters.
   * @returns A promise that resolves to an array of User objects.
   */
  async handle (event: ReactIncomingEvent): Promise<ListMetadataOptions<TeamMember>> {
    const missionUuid = event.cookies.getValue<Mission>('mission')?.uuid ?? ''
    return await this.teamMemberService.list({ missionUuid }, event.get('query.limit', 55), event.get('query.page'))
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Tralala - Membres',
      description: 'Liste des membres de votre équipe. Découvrez leurs rôles et statistiques.'
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ data }: PageRenderContext<ListMetadataOptions<TeamMember>>): JSX.Element {
    return (
      <div className='w-full max-w-7xl mx-auto px-4 mt-6'>
        <MemberList members={data?.items ?? []} />
      </div>
    )
  }
}
