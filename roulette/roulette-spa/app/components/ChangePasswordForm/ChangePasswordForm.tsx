import { JSX, useState } from 'react'
import { AlertBox } from '../AlertBox/AlertBox'
import { StoneLink } from '@stone-js/use-react'
import { FormInput } from '../FormInput/FormInput'
import { FormButton } from '../FormButton/FormButton'
import { SecurityService } from '../../services/SecurityService'

interface ChangePasswordFormProps {
  onChange: () => void
  securityService: SecurityService
}

export const ChangePasswordForm = ({ onChange, securityService }: ChangePasswordFormProps): JSX.Element => {
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    setLoading(true)
    setError(undefined)

    securityService
      .changePassword({ otp, newPassword: password })
      .then(() => onChange())
      .catch((e: any) => {
        setError(e.response?.data?.errors?.message ?? e.message)
      })
      .finally(() => setLoading(false))
  }

  return (
    <form onSubmit={onSubmit}>
      <AlertBox>
        <strong className='text-green-300 font-medium'>Ajoutez un mot de passe à votre compte pour profiter pleinement de l’Opération Adrénaline.</strong> <br />
        Vous pouvez le faire dès maintenant ou plus tard, c’est vous qui décidez.
        <br />
        <strong className='text-green-300 font-medium'>Important : </strong> Vous disposez de <strong className='text-green-300 font-medium'>5 OTP (One-Time Password)</strong> maximum. <br />
        Une fois tous utilisés, il ne sera plus possible d’accéder à votre compte sans mot de passe.
      </AlertBox>

      <FormInput
        type='text'
        name='otp'
        value={otp}
        maxLength={6}
        inputMode='numeric'
        placeholder='Entrez votre OTP'
        onChange={(e) => setOtp(e.target.value)}
      />

      <FormInput
        name='password'
        type='password'
        value={password}
        className='mt-2'
        placeholder='Entrez votre mot de passe'
        onChange={(e) => setPassword(e.target.value)}
      />

      {error !== undefined && <AlertBox variant='error' className='mt-4'>{error}</AlertBox>}

      <FormButton type='submit' disabled={loading || password.length < 6 || otp.length !== 6}>
        {loading ? 'Validation...' : 'Valider'}
      </FormButton>

      <StoneLink
        to='/'
        className='w-full mt-2 border border-white/20 hover:bg-white/10 text-white text-center font-medium py-3 rounded-md transition'
      >
        Plus tard
      </StoneLink>
    </form>
  )
}
