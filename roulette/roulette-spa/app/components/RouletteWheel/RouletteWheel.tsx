import './RouletteWheel.css'
import { JSX, useState } from 'react'
import confetti from 'canvas-confetti'
import { playSound } from '../../utils'
import moai from '../../../assets/img/moai.png'
import tada from '../../../assets/audio/tada.mp3'
import { SpinResult } from '../../models/Roulette'
import playing from '../../../assets/audio/playing.mp3'
import roulette from '../../../assets/img/roulette.png'

/**
 * Props for the RouletteWheel component.
 */
export interface RouletteWheelProps {
  onSpin: () => Promise<SpinResult>
}

/**
 * RouletteWheel component simulates a spinning roulette wheel that randomly selects a color.
 */
export const RouletteWheel = ({ onSpin }: RouletteWheelProps): JSX.Element => {
  const [spinClass, setSpinClass] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)

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

    onSpin()
      .then((result) => {
        playSound(tada)
        fireConfetti()
        setSpinClass(`spin-to-${result.color}`)
      })
      .catch(() => setSpinClass(''))
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

      <button
        onClick={spin}
        disabled={isDisabled}
        className='mt-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded-md transition disabled:opacity-50'
      >
        Lancer l'opération
      </button>
    </div>
  )
}
