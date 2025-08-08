import { COLOR_MAP } from '../../constants'
import { JSX, useEffect, useState } from 'react'
import { Team, TeamMember } from '../../models/Team'

/**
 * Props for the TeamPanel component.
 */
export interface TeamPanelProps {
  team: Team
  members?: TeamMember[]
}

/**
 * TeamPanel component displays the revealed color and its teammates.
 */
export const TeamPanel = ({ team, members = [] }: TeamPanelProps): JSX.Element => {
  const bg = COLOR_MAP[team.color] ?? '#444'
  const [visible, setVisible] = useState(false)

  useEffect(() => setVisible(true), [team.color])

  return (
    <aside
      style={{ backgroundColor: bg }}
      className={`w-full mt-6 sm:w-64 sm:mt-0 rounded-lg p-4 text-white shadow-md transition-all duration-500 ease-out transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <h2 className='text-lg font-bold text-center uppercase tracking-wide'>
        Unité {team.name ?? 'Inconnu'}
      </h2>

      <div className='mt-4'>
        <h3 className='text-sm font-semibold mb-2 text-white/90'>
          Membres ({team.countMembers}/{team.totalMembers})
        </h3>

        {members.length > 0
          ? (
            <ul className='space-y-1 text-sm mb-4'>
              {members.map((member) => (
                <li
                  key={member.name}
                  className='bg-white/20 px-3 py-1 rounded-md backdrop-blur-sm'
                >
                  {member.name}
                </li>
              ))}
            </ul>
            )
          : (
            <p className='text-white/70 text-sm italic mb-4'>
              Aucun membre pour l’instant.
            </p>
            )}
      </div>

      <a
        href={team.chatLink ?? '#'}
        target='_blank'
        rel='noopener noreferrer'
        className='block w-full text-center bg-white/20 hover:bg-white/30 text-sm font-medium py-2 rounded-md transition'
      >
        Rejoindre ton équipe
      </a>
    </aside>
  )
}
