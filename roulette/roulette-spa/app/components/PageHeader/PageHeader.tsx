import { Team } from '../../models/Team'
import { User } from '../../models/User'
import { Avatar } from '../Avatar/Avatar'
import { COLOR_MAP } from '../../constants'
import { Spinner } from '../Spinner/Spinner'
import React, { JSX, useState } from 'react'
import { Megaphone, Camera } from 'lucide-react'

interface PageHeaderProps {
  team: Team
  currentUser: User
  onLogoChange?: (file: File) => Promise<void>
  onBannerChange?: (file: File) => Promise<void>
}

export const PageHeader: React.FC<PageHeaderProps> = ({ team, currentUser, onLogoChange, onBannerChange }): JSX.Element => {
  const [previewLogo, setPreviewLogo] = useState<string | undefined>(team.logoUrl)
  const [previewBanner, setPreviewBanner] = useState<string | undefined>(team.bannerUrl)

  const [loadingLogo, setLoadingLogo] = useState(false)
  const [loadingBanner, setLoadingBanner] = useState(false)

  const canEdit = team.members?.some(member => member.uuid === currentUser.uuid && member.role === 'captain') || currentUser.isAdmin

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    if (type === 'logo') {
      setPreviewLogo(url)
      if (onLogoChange) {
        setLoadingLogo(true)
        await onLogoChange(file)
        setLoadingLogo(false)
      }
    } else {
      setPreviewBanner(url)
      if (onBannerChange) {
        setLoadingBanner(true)
        await onBannerChange(file)
        setLoadingBanner(false)
      }
    }
  }

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden mb-6 shadow"
      style={{ backgroundColor: '#10404a' }}
    >
      {/* Banner */}
      <div className="relative w-full h-60 group cursor-pointer" style={{ backgroundColor: COLOR_MAP[team.color] || '#333' }}>
        {canEdit && <input
          type="file"
          accept="image/*"
          className="hidden"
          id="banner-upload"
          onChange={(e) => handleFileChange(e, 'banner')}
        />}
        {canEdit && <label htmlFor="banner-upload" className="absolute inset-0 z-10 group-hover:bg-black/30 transition">
          <div className="absolute top-2 right-2 bg-white/80 text-black p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
            <Camera size={16} />
          </div>
        </label>}

        {loadingBanner ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : (
          <>
            {(previewBanner || team.bannerUrl) && (
              <img
                alt="banner"
                src={previewBanner || team.bannerUrl}
                className="w-full h-full object-cover"
              />
            )}
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-4 z-10 bg-gradient-to-t from-black/60 via-black/40 to-transparent">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative w-20 h-20 rounded-full border-4 border-white bg-gray-300 overflow-hidden flex-shrink-0 group cursor-pointer">
              {canEdit && <input
                type="file"
                accept="image/*"
                className="hidden"
                id="logo-upload"
                onChange={(e) => handleFileChange(e, 'logo')}
              />}
              <label htmlFor={canEdit ? "logo-upload" : ''} className="absolute inset-0 z-10 group-hover:bg-black/20 transition rounded-full flex items-center justify-center">
                {loadingLogo ? (
                  <Spinner />
                ) : (
                  <div className="absolute top-1 right-1 bg-white/80 text-black p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                    {canEdit && <Camera size={14} />}
                  </div>
                )}
                {previewLogo ? (
                  <img
                    src={previewLogo}
                    alt="logo preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Avatar
                    size={72}
                    name={team.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </label>
            </div>

            {/* Textual info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{team.name}</h2>
                <span className="w-3 h-3 rounded-full inline-block" />
              </div>
              {team.slogan && (
                <p className="flex items-center gap-2 text-sm text-white/70 mt-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 flex-shrink-0">
                    <Megaphone size={20} className="font-bold" color={COLOR_MAP[team.color]} />
                  </span>
                  {team.motto ?? team.slogan}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
