import { JSX } from 'react'
import { AlertBox } from '../AlertBox/AlertBox'
import { FormInput } from '../FormInput/FormInput'
import { UserRegistration } from '../../models/User'
import { FormButton } from '../FormButton/FormButton'

interface RegistrationStepProps {
  error?: string
  loading?: boolean
  values: UserRegistration
  onChange: (field: keyof UserRegistration, value: string) => void
}

export const RegistrationStep = ({
  values,
  error,
  onChange,
  loading = false
}: RegistrationStepProps): JSX.Element => {
  const { phone, mission, fullname } = values

  const isFormValid =
    phone.length >= 8 &&
    mission.trim() !== '' &&
    fullname.trim() !== ''

  return (
    <>
      <AlertBox>
        Veuillez vous inscrire pour demarrer la <strong className='text-green-300 font-medium'>mission</strong>.
      </AlertBox>

      <FormInput
        type='tel'
        name='phone'
        placeholder='Numéro de téléphone'
        value={phone}
        onChange={(e) => onChange('phone', e.target.value)}
        inputMode='tel'
      />

      <FormInput
        type='text'
        name='mission'
        placeholder='Code de mission'
        value={mission}
        className='mt-2'
        onChange={(e) => onChange('mission', e.target.value)}
      />

      <FormInput
        type='text'
        name='fullname'
        placeholder='Nom complet'
        value={fullname}
        className='mt-2'
        onChange={(e) => onChange('fullname', e.target.value)}
      />

      {error !== undefined && <AlertBox variant='error' className='mt-4'>{error}</AlertBox>}

      <FormButton type='submit' disabled={loading || !isFormValid}>
        {loading ? 'Inscription...' : 'S’inscrire'}
      </FormButton>
    </>
  )
}
