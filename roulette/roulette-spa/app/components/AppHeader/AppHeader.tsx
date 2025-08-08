import { User } from "../../models/User"
import { Spinner } from "../Spinner/Spinner"
import { RouteEvent } from "@stone-js/router"
import { JSX, useEffect, useState } from "react"
import { IContainer, isNotEmpty } from "@stone-js/core"
import { PRESENCE_EVENT_CATEGORY } from "../../constants"
import { ConfirmModal } from "../ConfirmModal/ConfirmModal"
import { SecurityService } from "../../services/SecurityService"
import { IRouter, ReactIncomingEvent, StoneLink } from "@stone-js/use-react"
import { ActivityAssignmentService } from "../../services/ActivityAssignmentService"
import { ActivitySquare, BadgeCheck, Gamepad2, GroupIcon, LogOutIcon, MenuIcon, User as UserIcon } from "lucide-react"

interface AppHeaderProps {
  container: IContainer
  onMenuToggle?: () => void
}

export const AppHeader = ({ container, onMenuToggle }: AppHeaderProps): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isPunching, setIsPunching] = useState(false)
  const [user, setUser] = useState<User | undefined>()
  
  const router = container.make<IRouter>('router')
  const securityService = container.make<SecurityService>('securityService')
  const activityAssignmentService = container.make<ActivityAssignmentService>('activityAssignmentService')
  const setCurrentUser = () => {
    setUser(
      container.make<ReactIncomingEvent>('event').getUser()
    )
  }

  useEffect(() => {
    setCurrentUser()
    // router.on(RouteEvent.ROUTED, setCurrentUser)
    // return () => { router.off(RouteEvent.ROUTED, setCurrentUser) }
  }, [router])

  const onPunch = () => {
    if (!user) return
    setIsPunching(true)
    activityAssignmentService.create({
      memberUuid: user.uuid,
      teamUuid: user.teamUuid,
      activityCategory: PRESENCE_EVENT_CATEGORY,
    })
      .then(() => {
        setUser({ ...user, isPunched: true })
      })
      .finally(() => {
        setIsPunching(false)
      })
  }

  const dropdownRef = (el: HTMLDivElement | null) => {
    if (isNotEmpty<HTMLDivElement>(el)) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (!el.contains(target) && !target.closest('#logout-button')) {
          setMenuOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => { document.removeEventListener('mousedown', handleClickOutside) }
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0b2e36] border-b border-white/10 py-4 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {onMenuToggle && <button
          onClick={() => onMenuToggle()}
          className="text-white md:hidden"
        >
          <MenuIcon size={24} />
        </button>}
        
        <StoneLink to='/' className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
          </div>
          <span className="hidden md:inline text-lg font-bold text-left uppercase tracking-wide">Tralala</span>
        </StoneLink>

        {user && <div className="relative">
          <nav className="md:flex items-center gap-3">
            <StoneLink
              to='/missions'
              className='items-center justify-center gap-2 hidden md:flex text-sm stone-link text-white border border-white/8 rounded-md px-6 py-2 transition duration-200 hover:bg-white/10'
            >
              <Gamepad2 size={16} /> Missions
            </StoneLink>
            <StoneLink
              to='/activities'
              className='items-center justify-center gap-2 hidden md:flex text-sm stone-link text-white border border-white/8 rounded-md px-6 py-2 transition duration-200 hover:bg-white/10'
            >
              <ActivitySquare size={16} /> Activities
            </StoneLink>
            <StoneLink
              to='/badges'
              className='items-center justify-center gap-2 hidden md:flex text-sm stone-link text-white border border-white/8 rounded-md px-6 py-2 transition duration-200 hover:bg-white/10'
            >
              <BadgeCheck size={16} /> Badges
            </StoneLink>
            <StoneLink
              to='/members'
              className='items-center justify-center gap-2 hidden md:flex text-sm stone-link text-white border border-white/8 rounded-md px-6 py-2 transition duration-200 hover:bg-white/10'
            >
              <GroupIcon size={16} /> Membres
            </StoneLink>
            <StoneLink
              to='/roulette'
              className='items-center justify-center gap-2 hidden md:flex text-sm stone-link text-white border border-white/8 rounded-md px-6 py-2 transition duration-200 hover:bg-white/10'
            >
              <Gamepad2 size={16} /> Roulette
            </StoneLink>
            <button
              id="logout-button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2"
            >
              <UserIcon size={16} /> <span className="hidden md:inline text-sm text-white/80 capitalize">{user.username}</span>
            </button>
          </nav>

          {menuOpen && (
            <div
              tabIndex={-1}
              ref={dropdownRef}
              className="absolute right-0 mt-2 bg-gradient-to-br from-[#183850] to-[#0b2e36] border border-white/20 rounded-xl shadow-2xl z-50 w-56 p-0.5 overflow-hidden animate-fade-in"
            >
              <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center">
                  <UserIcon size={22} className="text-white/80" />
                </div>
                <div>
                  <div className="font-semibold text-white">{user.fullname}</div>
                  <div className="text-xs text-white/50 capitalize">@{user.username}</div>
                </div>
              </div>
              <button
                onClick={onPunch}
                disabled={isPunching}
                className='flex w-full items-center justify-center gap-2 text-sm text-white rounded-md px-6 py-2 transition duration-200 bg-orange-600 hover:bg-orange-600/80 disabled:bg-orange-600/50 disabled:cursor-not-allowed'
                >
                Je suis présent
                {isPunching && <Spinner />}
              </button>
              <div className="md:hidden">
                <StoneLink to='/missions' className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                  <Gamepad2 size={16} className="text-white/80" /> Missions
                </StoneLink>
                <StoneLink to="/activities" className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                  <ActivitySquare size={16} className="text-white/80" /> Activities
                </StoneLink>
                <StoneLink to="/badges" className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                  <BadgeCheck size={16} className="text-white/80" /> Badges
                </StoneLink>
                <StoneLink to="/members" className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                  <GroupIcon size={16} className="text-white/80" /> Membres
                </StoneLink>
                <StoneLink to="/spin" className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                  <Gamepad2 size={16} className="text-white/80" /> Roulette
                </StoneLink>
              </div>
              <button
                onClick={() => onLogout(router, securityService)}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors mt-2"
              >
                <LogOutIcon size={16} className="text-white/80" /> Se déconnecter
              </button>
              </div>
            </div>
          )}
        </div>}
      </div>

      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false)
          onLogout(router, securityService)
        }}
        message='Es-tu sûr de vouloir te déconnecter ?'
      />
    </header>
  )
}

/**
 * Logout the user.
 */
export function onLogout (router: IRouter, securityService: SecurityService): void {
  securityService.logout().then(() => {
    router.navigate('/', true)
  }).catch(() => {})
}
