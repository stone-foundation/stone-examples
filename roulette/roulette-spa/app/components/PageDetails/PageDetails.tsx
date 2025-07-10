import { Team } from '../../models/Team'
import { User } from '../../models/User'
import { PageInfo } from '../PageInfo/PageInfo'
import { PageHeader } from '../PageHeader/PageHeader'
import { PageMembers } from '../PageMembers/PageMembers'
import { TimelineFeed } from '../TimelineFeed/TimelineFeed'
import { TabItem, TabNavigation } from '../TabNavigation/TabNavigation'
import { TimelineComposer } from '../TimelineComposer/TimelineComposer'

interface PageDetailsProps {
  team: Team
  currentUser: User
  activePath?: string
}

export const PageDetails: React.FC<PageDetailsProps> = ({ team, currentUser, activePath = 'timeline' }) => {
  const tabs: TabItem[] = [
    { path: 'timeline', label: 'Timeline' },
    { path: 'infos', label: 'Infos' },
    { path: 'members', label: 'Soldats' },
    { path: 'events', label: 'Activités' },
    { path: 'badges', label: 'Badges' },
  ]

  return (
    <div className="flex-1 flex flex-col w-full">
      <PageHeader team={team} />
      <TabNavigation tabs={tabs} />
      <div className="flex flex-col-reverse lg:flex-row gap-6">
        <div className="flex-1">
          {activePath === 'timeline' && (
            <>
              <TimelineComposer userName="Lolo" onPost={(v) => { console.log(v)}} />
              <TimelineFeed currentUser={currentUser} fetchPosts={(): any => {}} />
            </>
          )}
          {activePath === 'info' && <PageInfo team={team} />}
          {activePath === 'members' && <PageMembers members={[]} />}
        </div>
      </div>
    </div>
  )
}
