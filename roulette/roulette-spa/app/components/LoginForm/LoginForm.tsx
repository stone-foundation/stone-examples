import { JSX, useState } from 'react'
import { PhoneStep } from '../PhoneStep/PhoneStep'
import { OTPActivation } from '../OTPActivation/OTPActivation'
import { PasswordLogin } from '../PasswordLogin/PasswordLogin'
import { SecurityService } from '../../services/SecurityService'

type Step = 'phone' | 'otp' | 'password'

interface LoginFormProps {
  onLogin: () => void
  onActivate: () => void
  securityService: SecurityService
}

export const LoginForm = ({ onLogin, onActivate, securityService }: LoginFormProps): JSX.Element => {
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('phone')
  const [error, setError] = useState<string | undefined>()

  const handlePhoneSubmit = (): void => {
    setLoading(true)
    setError(undefined)

    securityService
      .activate(phone)
      .then((result) => {
        setStep(result.isActive ? 'password' : 'otp')
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

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    if (step === 'phone') {
      handlePhoneSubmit()
    } else if (step === 'otp') {
      handleOtpSubmit()
    } else if (step === 'password') {
      handlePasswordSubmit()
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {step === 'phone' && (
        <PhoneStep
          phone={phone}
          error={error}
          loading={loading}
          onChangePhone={setPhone}
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
