import { Logger } from "@stone-js/core";
import { StoneContext } from "@stone-js/use-react";
import { TeamsStats } from "../../models/Activity";
import { useState, useContext, useEffect } from "react";
import { TopTeamCard } from "../TopTeamCard/TopTeamCard";
import { StatsSection } from "../StatsSection/StatsSection";
import { GlobalStatsCard } from "../GlobalStatsCard/GlobalStatsCard";
import { RecentBadgesCard } from "../RecentBadgesCard/RecentBadgesCard";
import { ActivityAssignmentService } from "../../services/ActivityAssignmentService";

export function RightSidebarPanel() {
  const [stats, setStats] = useState<TeamsStats>()
  const activityAssignmentService = useContext(StoneContext).container.resolve<ActivityAssignmentService>(ActivityAssignmentService)

  useEffect(() => {
    activityAssignmentService
      .stats()
      .then(v => {
        setStats(v)
      })
      .catch(error => {
        Logger.error("Failed to fetch stats:", error)
      })
  }, [])

  return (
    <aside className="w-full space-y-6 mt-8 md:mt-0">
      <StatsSection title="Équipe en tête">
        <TopTeamCard teams={stats?.teams ?? []} />
      </StatsSection>

      <StatsSection title="Statistiques globales">
        <GlobalStatsCard
          stats={{
            totalPosts: stats?.totalPosts ?? 0,
            totalBadges: stats?.totalBadges ?? 0,
            totalPresence: stats?.totalPresence ?? 0,
            totalSoldiers: stats?.totalMembers ?? 0,
          }}
        />
      </StatsSection>

      {Boolean(stats?.totalBadges) && <StatsSection title="Derniers badges attribués">
        <RecentBadgesCard teams={stats?.teams ?? []} />
      </StatsSection>}
    </aside>
  )
}
