import './RouletteWheel.css'
import { JSX, useState } from 'react'
import confetti from 'canvas-confetti'
import { playSound } from '../../utils'
import moai from '../../../assets/img/moai.png'
import tada from '../../../assets/audio/tada.mp3'
import { FormInput } from '../FormInput/FormInput'
import roulette from '../../../assets/img/roulette.png'
import playing from '../../../assets/audio/playing.mp3'
import { SpinPayload, SpinResult } from '../../models/Roulette'

/**
 * Props for the RouletteWheel component.
 */
export interface RouletteWheelProps {
  memberName?: string
  missionUuid: string
  onSpin: (data: SpinPayload) => Promise<SpinResult>
}

/**
 * RouletteWheel component simulates a spinning roulette wheel that randomly selects a color.
 */
export const RouletteWheel = ({ onSpin, missionUuid, memberName }: RouletteWheelProps): JSX.Element => {
  const [spinClass, setSpinClass] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)
  const [playerName, setPlayerName] = useState(memberName ?? '')

  const fireConfetti = (): void => {
    confetti({
      spread: 70,
      particleCount: 80,
      origin: { y: 0.4 },
      colors: ['#e74c3c', '#3498db', '#f1c40f', '#27ae60', '#9b59b6']
    })?.catch(() => setSpinClass(''))
  }

  const spin = (): void => {
    if (isDisabled) return

    setIsDisabled(true)
    setSpinClass('spin-infinite')

    playSound(playing)

    onSpin({ name: playerName, missionUuid })
      .then((result) => {
        playSound(tada)
        fireConfetti()
        setSpinClass(`spin-to-${result.color}`)
      })
      .catch(() => setSpinClass(''))
      .finally(() => setIsDisabled(false))
  }

  return (
    <div className='flex flex-col items-center'>
      <div className='relative'>
        <div className='indicator' />
        <div className={`wheel ${spinClass}`}>
          <div className='center'>
            <img src={moai} alt='Stone+Symbiose' />
          </div>
          <img src={roulette} alt='roulette' />
        </div>
      </div>

      <FormInput
        type='text'
        name='memberName'
        placeholder='Choisissez un nom de joueur unique'
        value={playerName}
        className='mt-6 text-center w-64'
        onChange={(e) => setPlayerName(e.target.value)}
      />

      <button
        onClick={spin}
        disabled={isDisabled || playerName.trim().length < 2}
        className='mt-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded-md transition disabled:opacity-50'
      >
        Tralala
      </button>
    </div>
  )
}
