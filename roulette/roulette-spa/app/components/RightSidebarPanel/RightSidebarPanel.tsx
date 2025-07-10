import { Team } from "../../models/Team";
import { BadgeTeam } from "../../models/Badge";
import { TopTeamCard } from "../TopTeamCard/TopTeamCard";
import { StatsSection } from "../StatsSection/StatsSection";
import { GlobalStatsCard } from "../GlobalStatsCard/GlobalStatsCard";
import { RecentBadgesCard } from "../RecentBadgesCard/RecentBadgesCard";

export function RightSidebarPanel() {
  const teams = [
    { name: 'Alpha', color: 'blue', countMember: 5, totalMember: 10, score: 120 } as Team,
    { name: 'Bravo', color: 'red', countMember: 3, totalMember: 8, score: 95 } as Team,
    { name: 'Charlie', color: 'green', countMember: 4, totalMember: 6, score: 80 } as Team,
  ] as unknown as Team[]

  const badges = [
    {
      uuid: 'badge-1',
      name: 'Top Contributor',
      description: 'Awarded for outstanding contributions',
      issuedAt: new Date().getTime(),
      team: { name: 'Alpha', color: '#FF5733' } as unknown as Team
    },
    {
      uuid: 'badge-2',
      name: 'Community Helper',
      description: 'For helping others in the community',
      issuedAt: new Date().getTime() - 86400000,
      team: { name: 'Bravo', color: '#33FF57' } as unknown as Team
    },
  ] as unknown as BadgeTeam[]

  return (
    <aside className="w-full space-y-6 mt-8 md:mt-0">
      <StatsSection title="Équipe en tête">
        <TopTeamCard teams={teams} />
      </StatsSection>

      <StatsSection title="Statistiques globales">
        <GlobalStatsCard
          stats={{
            totalPosts: 120,
            totalBadges: 16,
            totalPresence: 47,
            totalSoldiers: 54
          }}
        />
      </StatsSection>

      <StatsSection title="Derniers badges attribués">
        <RecentBadgesCard badges={badges} />
      </StatsSection>
    </aside>
  )
}
