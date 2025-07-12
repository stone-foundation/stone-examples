import React, { JSX } from 'react'
import { Team } from '../../models/Team'
import { COLOR_MAP } from '../../constants'
import { Avatar } from '../Avatar/Avatar'
import { Megaphone } from 'lucide-react'

interface PageHeaderProps {
  team: Team
}

export const PageHeader: React.FC<PageHeaderProps> = ({ team }): JSX.Element => {
  return (
    <div
      className='relative w-full rounded-xl overflow-hidden mb-6 shadow'
      style={{ backgroundColor: '#10404a' }}
    >
      {/* Banner */}
      <div className='w-full h-40' style={{ backgroundColor: COLOR_MAP[team.color] || '#333' }}>
        {team.bannerUrl && (
          <img
            alt='banner'
            src={team.bannerUrl}
            className='w-full h-full object-cover'
          />
        )}
      </div>

      {/* Info Box */}
      <div className='flex flex-col md:flex-row items-center justify-between px-4 md:px-8 -mt-10 pb-4'>
        <div className='flex items-center gap-4'>
          {/* Logo */}
          <div className='w-20 h-20 rounded-full border-4 border-white bg-gray-300 overflow-hidden flex-shrink-0'>
            <Avatar
              size={72}
              name={team.name}
              className='w-full h-full object-cover'
            />
          </div>

          {/* Textual info */}
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <h2 className='text-xl font-bold text-white'>{team.name}</h2>
              <span className='w-3 h-3 rounded-full inline-block' />
            </div>
            {team.slogan && (
              <p className='flex items-center gap-2 text-sm text-white/70 mt-6'>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 flex-shrink-0">
                  <Megaphone size={20} className='font-bold' color={COLOR_MAP[team.color]} />
                </span>
                {team.motto ?? team.slogan}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
