import { JSX } from 'react'
import { AlertBox } from '../AlertBox/AlertBox'
import { FormInput } from '../FormInput/FormInput'
import { FormButton } from '../FormButton/FormButton'

interface VerificationStepProps {
  phone: string
  error?: string
  loading?: boolean
  onChangePhone: (value: string) => void
}

export const VerificationStep = ({
  phone,
  error,
  onChangePhone,
  loading = false
}: VerificationStepProps): JSX.Element => (
  <>
    <FormInput
      type='tel'
      name='phone'
      placeholder='Numéro de téléphone'
      value={phone}
      onChange={(e) => onChangePhone(e.target.value)}
      inputMode='tel'
    />

    {error !== undefined && <AlertBox variant='error' className='mt-4'>{error}</AlertBox>}

    <FormButton type='submit' disabled={loading || phone.length < 8}>
      {loading ? 'Vérification...' : 'Valider'}
    </FormButton>
  </>
)
