import { AlertBox } from '../AlertBox/AlertBox'
import { FormInput } from '../FormInput/FormInput'
import { FormButton } from '../FormButton/FormButton'
import { JSX } from 'react'

interface OTPActivationProps {
  otp: string
  error?: string
  loading?: boolean
  phoneNumber: string
  onChangeOtp: (value: string) => void
}

export const OTPActivation = ({
  otp,
  error,
  phoneNumber,
  onChangeOtp,
  loading = false
}: OTPActivationProps): JSX.Element => (
  <>
    <AlertBox>
      Un <strong className='text-green-300 font-medium'>OTP</strong> a été envoyé par SMS au <strong className='text-green-300'>{phoneNumber}</strong>.
      Veuillez l’entrer ci-dessous pour activer votre compte.
    </AlertBox>

    <FormInput
      type='text'
      name='otp'
      value={otp}
      maxLength={6}
      inputMode='numeric'
      placeholder='Entrez votre OTP'
      onChange={(e) => onChangeOtp(e.target.value)}
    />

    {error !== undefined && <AlertBox variant='error' className='mt-4'>{error}</AlertBox>}

    <FormButton type='submit' disabled={loading || otp.length !== 6}>
      {loading ? 'Activation...' : 'Activer mon compte'}
    </FormButton>
  </>
)
