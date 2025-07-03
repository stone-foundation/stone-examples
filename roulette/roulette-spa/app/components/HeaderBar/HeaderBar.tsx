import { FC, useState } from 'react'
import { User } from '../../models/User'
import { IContainer } from '@stone-js/core'
import { ConfirmModal } from '../ConfirmModal/ConfirmModal'
import { SecurityService } from '../../services/SecurityService'
import { IRouter, ReactIncomingEvent } from '@stone-js/use-react'

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
        <div className='flex justify-between items-center mb-12'>
          <span className='font-medium text-lg'>{user.username ?? 'Inconnu'}</span>
          <button
            onClick={() => setShowModal(true)}
            className='text-sm text-white border border-white/8 rounded-md px-6 py-2 transition duration-200 hover:bg-white/10'
          >
            Se déconnecter
          </button>
        </div>
        <h1 className='text-center text-5xl uppercase font-bold tracking-wide mb-4'>
          OPÉRATION<br /> ADRÉNALINE
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
