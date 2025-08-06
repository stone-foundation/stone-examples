import { JSX } from 'react'
import { Footer } from '../Footer/Footer'
import { StoneLink } from '@stone-js/use-react'
import katingImage from '../../../assets/img/karting.jpg'
import paintballImage from '../../../assets/img/paintball.jpg'

export const LandingPage = (): JSX.Element => {
  return (
    <main className='min-h-screen bg-[#0b2e36] text-white flex flex-col items-center px-6 py-10'>
      <h1 className='text-4xl sm:text-5xl font-bold text-center uppercase tracking-wide mb-4 mt-5'>
        Tralala
      </h1>
      <p className='text-center text-lg sm:text-xl text-white/90 max-w-2xl mb-8'>
        Es-tu prêt à vivre une expérience de pur adrénaline entre amis ? Karting, Paintball, défis, rires, et surprises t’attendent dans cette opération spéciale.
        <br />
        Découvre ton unité en roulant la roulette et prépare-toi à l’action !
      </p>
      <h2 className='text-3xl sm:text-4xl font-bold text-center uppercase tracking-wide mb-8'>ESKE W PARE?</h2>

      <section className='grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl w-full mb-10 mt-5'>
        {/* Karting Section */}
        <div className='bg-[#123840] rounded-lg p-6 shadow-md text-center'>
          <div className='w-full bg-neutral-700 rounded-md mb-4 flex items-center justify-center text-white/50 text-sm'>
            <img src={katingImage} alt='Karting' className='w-full h-full object-cover rounded-md' />
          </div>
          <h2 className='text-xl font-semibold mb-2'>Karting</h2>
          <p className='text-sm text-white/80'>Sensations fortes, vitesse et fun ! Viens te mesurer à d’autres soldats de l’Opération.</p>
        </div>

        {/* Paintball Section */}
        <div className='bg-[#123840] rounded-lg p-6 shadow-md text-center'>
          <div className='w-full bg-neutral-700 rounded-md mb-4 flex items-center justify-center text-white/50 text-sm'>
            <img src={paintballImage} alt='Karting' className='w-full h-full object-cover rounded-md' />
          </div>
          <h2 className='text-xl font-semibold mb-2'>Paintball</h2>
          <p className='text-sm text-white/80'>Travail d’équipe, précision et stratégie ! Défends ton équipe avec courage !</p>
        </div>
      </section>

      <section className='mb-7 bg-[#113840] text-white rounded-xl p-6 text-center shadow-lg'>
        <h2 className='text-2xl font-bold mb-2'>Ne rate plus nos notifications</h2>
        <p className='text-sm text-neutral-300 mb-4'>
          Suis-nous sur <span className='font-semibold text-pink-400'>TikTok</span> et <span className='font-semibold text-pink-500'>Instagram</span>
        </p>
        <div className='flex justify-center gap-4'>
          <a
            href='https://www.tiktok.com/@symbiose223' // remplace par ton lien
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-md transition text-white font-medium'
          >
            TikTok
          </a>
          <a
            href='https://www.instagram.com/operation_adrenaline' // remplace par ton lien
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90 rounded-md transition text-white font-medium'
          >
            Instagram
          </a>
        </div>
      </section>

      <StoneLink
          to='/login'
          className='mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-md text-lg transition'
        >
          Se connecter et rouler la roulette
      </StoneLink>
      <Footer />
    </main>
  )
}
