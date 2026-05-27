import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your inbox for a 6-digit code.')
      setStep('otp')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('email')
    setOtp('')
    setError(null)
    setMessage(null)
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Follow-Up</h1>
        <p className="auth-subtitle">
          {step === 'email' ? 'Sign in to your tracker' : `Code sent to ${email}`}
        </p>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp}>
            <div className="field">
              <input
                className="field-input"
                type="email"
                placeholder="you@cocoa.capital"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || !email}
            >
              {loading ? 'Sending…' : 'Send code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="field">
              <input
                className="field-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                autoFocus
                style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '20px' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying…' : 'Sign in'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={handleBack}
              style={{ marginTop: 12, display: 'block', margin: '12px auto 0' }}
            >
              ← Use a different email
            </button>
          </form>
        )}

        {message && <div className="auth-message">{message}</div>}
        {error && <div className="auth-message error">{error}</div>}
      </div>
    </div>
  )
}