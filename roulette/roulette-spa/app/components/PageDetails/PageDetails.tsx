import { Team } from '../../models/Team'
import { User } from '../../models/User'
import { Post } from '../../models/Post'
import { Badge } from '../../models/Badge'
import { PageInfo } from '../PageInfo/PageInfo'
import { PageHeader } from '../PageHeader/PageHeader'
import { PageBadges } from '../PageBadges/PageBadges'
import { ListMetadataOptions } from '../../models/App'
import { PageMembers } from '../PageMembers/PageMembers'
import { ActivityAssignment } from '../../models/Activity'
import { TimelineFeed } from '../TimelineFeed/TimelineFeed'
import { PageActivities } from '../PageActivities/PageActivities'
import { TimelineComposer } from '../TimelineComposer/TimelineComposer'
import { TabItem, TabNavigation } from '../TabNavigation/TabNavigation'

interface PageDetailsProps {
  team: Team
  badges: Badge[]
  currentUser: User
  activePath?: string
  activityAssignments: ActivityAssignment[]
  onLogoChange?: (file: File) => Promise<void>
  onBannerChange?: (file: File) => Promise<void>
  savePost: (payload: Partial<Post>) => Promise<void>
  onUpdateInfos: (data: Partial<Team>) => Promise<void>
  fetchPosts: (limit?: number, page?: string | number) => Promise<ListMetadataOptions<Post>>
  onUpdateAssigmentStatus: (assignment: ActivityAssignment, payload: Partial<ActivityAssignment>) => Promise<void>
}

export const PageDetails: React.FC<PageDetailsProps> = ({ onLogoChange, onBannerChange, onUpdateAssigmentStatus: onUpdateAssigment, activityAssignments, badges, team, onUpdateInfos, fetchPosts, savePost, currentUser, activePath = 'timeline' }) => {
  const tabs: TabItem[] = [
    { path: `/page/${team.name}/`, label: 'Timeline' },
    { path: `/page/${team.name}/infos`, label: 'Infos' },
    { path: `/page/${team.name}/badges`, label: 'Badges' },
    { path: `/page/${team.name}/soldiers`, label: 'Soldats' },
    { path: `/page/${team.name}/activities`, label: 'Activités' },
  ]

  return (
    <div className="flex-1 flex flex-col w-full">
      <PageHeader team={team} currentUser={currentUser} onLogoChange={onLogoChange} onBannerChange={onBannerChange} />
      <TabNavigation tabs={tabs} />
      <div className="flex flex-col-reverse lg:flex-row gap-6">
        <div className="flex-1">
          {activePath === 'timeline' && (
            <>
            {currentUser && <TimelineComposer currentUser={currentUser} onPost={async (v) => await savePost(v)} />}
              <TimelineFeed currentUser={currentUser} fetchPosts={fetchPosts} />
            </>
          )}
          {activePath === 'infos' && <PageInfo currentUser={currentUser} team={team} onUpdate={onUpdateInfos} />}
          {activePath === 'soldiers' && <PageMembers members={team.members} currentUser={currentUser} />}
          {activePath === 'badges' && (
            <PageBadges
              badges={badges}
              currentUser={currentUser}
            />
          )}
          {activePath === 'activities' && (
            <PageActivities
              currentUser={currentUser}
              assignments={activityAssignments}
              onApprove={async (assignment) => await onUpdateAssigment(assignment, { status: 'approved' })}
              onCancel={async (assignment) => await onUpdateAssigment(assignment, { status: 'cancelled' })}
              onArchive={async (assignment) => await onUpdateAssigment(assignment, { status: 'archived' })}
              onContest={async (assignment) => await onUpdateAssigment(assignment, { status: 'contested' })}
            />
          )}
        </div>
      </div>
    </div>
  )
}
