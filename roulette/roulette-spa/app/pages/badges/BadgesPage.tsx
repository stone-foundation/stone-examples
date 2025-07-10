import { JSX } from 'react'
import { User } from '../../models/User'
import { Team, TeamMember } from '../../models/Team'
import { Badges } from '../../components/Badges/Badges'
import { Badge, BadgeAssignPayload } from '../../models/Badge'
import { Page, ReactIncomingEvent, IPage, HeadContext, PageRenderContext } from '@stone-js/use-react'

/**
 * Interface for the response of the BadgesPage.
 */
interface HandleResponse {
  badges: Badge[]
  teams: Team[]
  membersByTeam: Record<string, TeamMember[]>
}

/**
 * Badges Page component.
 */
@Page('/badges', { layout: 'private-default' })
export class BadgesPage implements IPage<ReactIncomingEvent> {
  /**
   * Handle the incoming event and return a list of badges.
   *
   * @param event - The incoming event containing user information.
   * @returns A promise that resolves to an array of Badge objects.
   */
  async handle (event: ReactIncomingEvent): Promise<HandleResponse> {
    const badges: Badge[] = [
      {
      uuid: '1',
      author: { username: 'alice', fullname: 'Alice Smith' } as User,
      name: 'Courageux',
      color: '#FF5733',
      score: 10,
      type: 'victory',
      createdAt: Date.now() - 1000000,
      typeLabel: 'Succès',
      updatedAt: Date.now() - 500000,
      description: 'Attribué pour avoir relevé un défi difficile.'
      },
      {
      uuid: '2',
      author: { username: 'bob', fullname: 'Bob Martin' } as User,
      name: 'Esprit d\'équipe',
      color: '#33C3FF',
      score: 8,
      type: 'participation',
      createdAt: Date.now() - 2000000,
      typeLabel: 'Collaboration',
      updatedAt: Date.now() - 1000000,
      description: 'Pour une excellente collaboration en équipe.'
      },
      {
      uuid: '3',
      author: { username: 'eve', fullname: 'Eve Johnson' } as User,
      name: 'Créatif',
      color: '#8D33FF',
      score: 12,
      type: 'victory',
      createdAt: Date.now() - 3000000,
      typeLabel: 'Créativité',
      updatedAt: Date.now() - 2000000,
      description: 'Pour avoir proposé une idée innovante.'
      }
    ]

    return {
      badges,
      teams: [],
      membersByTeam: {},
    }
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Opération Adrénaline - Badges',
      description: 'Gerez les badges de l\'opération Adrénaline',
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ data, event }: PageRenderContext<HandleResponse>): JSX.Element {
    const user = event.getUser<User>() ?? { username: 'Jonh', fullname: 'Doe' } as unknown as User

    return (
      <main>
        <Badges
          currentUser={user}
          teams={data?.teams ?? []}
          badges={data?.badges ?? []}
          onUpdate={v => this.updateBadge(v)}
          onCreate={v => this.createBadge(v)}
          membersByTeam={data?.membersByTeam ?? {}}
          onDelete={badge => this.deleteBadge(badge)}
          onAssign={payload => this.assignBadge(payload)}
        />
      </main>
    )
  }

  private createBadge (badge: Partial<Badge>) {}

  private updateBadge (badge: Partial<Badge>) {}

  private deleteBadge (badge: Partial<Badge>) {}
  
  private assignBadge (payload: BadgeAssignPayload) {}
}
