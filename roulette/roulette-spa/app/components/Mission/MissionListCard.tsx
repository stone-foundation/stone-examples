import { isEmpty } from "@stone-js/core"
import { Avatar } from "../Avatar/Avatar"
import { Mission } from "../../models/Mission"
import { StoneLink } from "@stone-js/use-react"

interface MissionListCardProps {
  mission: Mission
}

export function MissionListCard({ mission }: MissionListCardProps) {
  return (
    <StoneLink
      to={`/missions/${mission.uuid}`}
      className="rounded-lg sidebar-menu-link flex items-center gap-4 mb-1 justify-start w-full text-left bg-[#0d3a43] p-4 md:rounded-xl shadow-inner mb-4 transition-all hover:bg-white/10 hover:shadow-sm"
    >
      <Avatar size={40} name={mission.name} imageUrl={mission.imageUrl} className="bg-white/50 flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <span className="text-sm font-medium capitalize text-white/80">{mission.name}</span>
        <div className="text-sm text-gray-400">
          <p>Code: {mission.code}</p>
          <p>État: {isEmpty(mission.endDate) ? 'En cours' : 'Terminée'}</p>
        </div>
      </div>
    </StoneLink>
  )
}
