import { JSX } from 'react'
import { User } from '../../models/User'
import { UserService } from '../../services/UserService'
import { MemberList } from '../../components/MemberList/MemberList'
import { Page, ReactIncomingEvent, IPage, HeadContext, PageRenderContext } from '@stone-js/use-react'

/**
 * Members Page options.
 */
interface MembersPageOptions {
  userService: UserService
}

/**
 * Members Page component.
 */
@Page('/soldiers', { layout: 'private-default', middleware: ['auth'] })
export class MembersPage implements IPage<ReactIncomingEvent> {
  private readonly userService: UserService

  /**
   * Create a new Login Page component.
   */
  constructor ({ userService }: MembersPageOptions) {
    this.userService = userService
  }

  /**
   * Handle the incoming event and fetch the list of users.
   *
   * @param event - The incoming event containing query parameters.
   * @returns A promise that resolves to an array of User objects.
   */
  async handle (event: ReactIncomingEvent): Promise<User[]> {
    return await this.userService.list(event.get('query.limit', 55))
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Opération Adrénaline - Membres',
      description: 'Liste des membres de votre unité. Découvrez leurs rôles et statistiques.'
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ data = [] }: PageRenderContext<User[]>): JSX.Element {
    return (
      <div className='w-full max-w-7xl mx-auto px-4 mt-6'>
        <MemberList members={data} />
      </div>
    )
  }
}
