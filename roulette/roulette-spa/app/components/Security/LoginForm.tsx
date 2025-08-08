import { JSX, useState } from 'react'
import { OTPActivation } from './OTPActivation'
import { PasswordLogin } from './PasswordLogin'
import { VerificationStep } from './VerificationStep'
import { RegistrationStep } from './RegistrationStep'
import { SecurityService } from '../../services/SecurityService'

type Step = 'verification' | 'otp' | 'password' | 'registration'

interface LoginFormProps {
  onLogin: () => void
  onActivate: () => void
  securityService: SecurityService
}

export const LoginForm = ({ onLogin, onActivate, securityService }: LoginFormProps): JSX.Element => {
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [mission, setMission] = useState('')
  const [password, setPassword] = useState('')
  const [fullname, setFullname] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('verification')
  const [error, setError] = useState<string | undefined>()

  const handleVerificationSubmit = (): void => {
    setLoading(true)
    setError(undefined)

    securityService
      .verifyActivation(phone)
      .then((result) => {
        switch (result.status) {
          case 'not_found':
            return setStep('registration')
          case 'inactive':
            return setStep('otp')
          case 'active':
            return setStep('password')
        }
      })
      .catch((e: any) => {
        setError(e.response?.data?.errors?.message ?? e.message)
      })
      .finally(() => setLoading(false))
  }

  const handleOtpSubmit = (): void => {
    setLoading(true)
    setError(undefined)

    securityService
      .login({ phone, otp })
      .then(() => onActivate())
      .catch((e: any) => {
        setError(e.response?.data?.errors?.message ?? e.message)
      })
      .finally(() => setLoading(false))
  }

  const handlePasswordSubmit = (): void => {
    setLoading(true)
    setError(undefined)

    securityService
      .login({ phone, password })
      .then(() => onLogin())
      .catch((e: any) => {
        setError(e.response?.data?.errors?.message ?? e.message)
      })
      .finally(() => setLoading(false))
  }

  const handleRegistrationSubmit = (): void => {
    setLoading(true)
    setError(undefined)

    securityService
      .register({ phone, mission, fullname })
      .then(() => {
        setStep('otp')
      })
      .catch((e: any) => {
        setError(e.response?.data?.errors?.message ?? e.message)
      })
      .finally(() => setLoading(false))
  }

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    if (step === 'verification') {
      handleVerificationSubmit()
    } else if (step === 'otp') {
      handleOtpSubmit()
    } else if (step === 'password') {
      handlePasswordSubmit()
    } else if (step === 'registration') {
      handleRegistrationSubmit()
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {step === 'verification' && (
        <VerificationStep
          phone={phone}
          error={error}
          loading={loading}
          onChangePhone={setPhone}
        />
      )}
      {step === 'registration' && (
        <RegistrationStep
          loading={loading}
          error={error}
          values={{ phone, mission, fullname }}
          onChange={(field, value) => {
            if (field === 'phone') setPhone(value)
            if (field === 'mission') setMission(value)
            if (field === 'fullname') setFullname(value)
          }}
        />
      )}
      {step === 'otp' && (
        <OTPActivation
          otp={otp}
          error={error}
          loading={loading}
          phoneNumber={phone}
          onChangeOtp={setOtp}
        />
      )}
      {step === 'password' && (
        <PasswordLogin
          error={error}
          loading={loading}
          password={password}
          onChangePassword={setPassword}
        />
      )}
    </form>
  )
}
