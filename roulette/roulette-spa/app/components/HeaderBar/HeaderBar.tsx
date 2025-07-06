import { FC, useState } from 'react'
import { User } from '../../models/User'
import { IContainer } from '@stone-js/core'
import { ConfirmModal } from '../ConfirmModal/ConfirmModal'
import { SecurityService } from '../../services/SecurityService'
import { IRouter, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

/**
 * Props for the HeaderBar component.
 */
export interface HeaderBarProps {
  container: IContainer
}

/**
 * HeaderBar component displays the top header with user information and logout button.
 */
export const HeaderBar: FC<HeaderBarProps> = ({ container }) => {
  const [showModal, setShowModal] = useState(false)

  const router = container.make<IRouter>('router')
  const securityService = container.make<SecurityService>('securityService')
  const user = container.make<ReactIncomingEvent>('event').getUser<User>() ?? {} as unknown as User

  return (
    <>
      <header className='w-full bg-[#0b2e36] text-white border-neutral-800 pt-4 pb-6'>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-12">
          <span className="font-medium capitalize text-lg text-center sm:text-left">{user.username ?? 'Inconnu'}</span>
          <nav className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <StoneLink
              to='/soldiers'
              className='text-sm stone-link text-white border border-white/8 rounded-md px-6 py-2 transition duration-200 hover:bg-white/10'
            >
              Liste des soldats
            </StoneLink>
            <StoneLink
              to='/spin'
              className='text-sm stone-link text-white border border-white/8 rounded-md px-6 py-2 transition duration-200 hover:bg-white/10'
            >
              Roulette
            </StoneLink>
            <button
              onClick={() => setShowModal(true)}
              className='text-sm text-white rounded-md px-6 py-2 transition duration-200 bg-orange-600 hover:bg-orange-600/80'
            >
              Se déconnecter
            </button>
          </nav>
        </div>
        <h1 className='text-center text-5xl uppercase font-bold tracking-wide mb-4'>
          OPÉRATION ADRÉNALINE
        </h1>
      </header>

      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false)
          onLogout(router, securityService)
        }}
        message='Es-tu sûr de vouloir te déconnecter ?'
      />
    </>
  )
}

/**
 * Logout the user.
 */
export function onLogout (router: IRouter, securityService: any): void {
  securityService.logout().then(() => {
    router.navigate('/', true)
  }).catch(() => {})
}
