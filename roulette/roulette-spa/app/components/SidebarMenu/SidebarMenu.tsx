import { Home } from "lucide-react"
import { Logger } from "@stone-js/core"
import { Team } from "../../models/Team"
import { Avatar } from "../Avatar/Avatar"
import { COLOR_MAP } from "../../constants"
import { Mission } from "../../models/Mission"
import { useContext, useEffect, useState } from "react"
import { FollowUsCard } from "../FollowUsCard/FollowUsCard"
import { RightSidebarPanel } from "../RightSidebarPanel/RightSidebarPanel"
import { ReactIncomingEvent, StoneContext, StoneLink } from "@stone-js/use-react"
import { ActivityAssignmentService } from "../../services/ActivityAssignmentService"

export const SidebarMenu = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const { container } = useContext(StoneContext)
  const activityAssignmentService = container.resolve<ActivityAssignmentService>(ActivityAssignmentService)
  const missionUuid = container.resolve<ReactIncomingEvent>('event')?.cookies.getValue<Mission>('mission')?.uuid ?? ''

  useEffect(() => {
    activityAssignmentService
      .stats({ missionUuid })
      .then(v => {
        setTeams(v.teams)
      })
      .catch(error => {
        Logger.error("Failed to fetch teams:", error)
      })
  }, [])

  return (
    <aside className="w-full sm:w-64 text-white">
      <StoneLink
        to="/"
        className="sidebar-menu-link flex items-center w-full text-left gap-2 bg-[#0d3a43] p-4 md:rounded-xl shadow-inner mb-4 hover:bg-white/10 transition"
      >
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/50">
          <Home size={24} className="text-[#0d3a43]" />
        </span>
        <span className="text-sm font-medium">Accueil</span>
      </StoneLink>

      {teams.map(team => (
        <SidebarMenuItem key={team.name} team={team} />
      ))}

      <div className="md:hidden px-4 md:px-0">
        <RightSidebarPanel />
      </div>

      <div className="px-4 md:px-0 mb-10 md:mb-0">
        <FollowUsCard />
      </div>
    </aside>
  )
}

interface SidebarMenuItemProps {
  team: Team
}

const SidebarMenuItem = ({ team }: SidebarMenuItemProps) => {
  const color = COLOR_MAP[team.color] ?? "#444"

  return (
    <StoneLink
      to={`/page/${team.name}/`}
      className="sidebar-menu-link flex items-center gap-2 mb-1 justify-start w-full text-left bg-[#0d3a43] p-4 md:rounded-xl shadow-inner mb-4 transition-all hover:bg-white/10 hover:shadow-sm"
    >
      <Avatar size={40} name={team.name} imageUrl={team.logoUrl} className="bg-white/50 flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <span className="text-sm font-medium capitalize">{team.name}</span>
        <div className="w-full h-2 bg-white/10 rounded-md overflow-hidden">
          <div
            className="h-full"
            style={{
              backgroundColor: color,
              transition: "width 0.3s ease",
              width: `${team.scorePercentage}%`
            }}
          />
        </div>
      </div>
    </StoneLink>
  )
}
