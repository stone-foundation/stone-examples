import { JSX } from 'react'
import { AlertBox } from '../AlertBox/AlertBox'
import { FormInput } from '../FormInput/FormInput'
import { FormButton } from '../FormButton/FormButton'

interface PasswordLoginProps {
  error?: string
  password: string
  loading?: boolean
  onChangePassword: (value: string) => void
}

export const PasswordLogin = ({
  error,
  password,
  loading = false,
  onChangePassword
}: PasswordLoginProps): JSX.Element => (
  <>
    <AlertBox>
      Veuillez entrer votre mot de passe pour vous connecter.
    </AlertBox>

    <FormInput
      name='password'
      type='password'
      value={password}
      placeholder='Mot de passe'
      onChange={(e) => onChangePassword(e.target.value)}
    />

    {error !== undefined && <AlertBox variant='error' className='mt-4'>{error}</AlertBox>}

    <FormButton type='submit' disabled={loading || password.length === 0}>
      {loading ? 'Connexion...' : 'Se connecter'}
    </FormButton>
  </>
)
