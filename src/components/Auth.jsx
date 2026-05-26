import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + window.location.pathname,
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your inbox — a magic link is on its way.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Follow-Up</h1>
        <p className="auth-subtitle">Sign in to your tracker</p>
        <form onSubmit={handleLogin}>
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
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
        {message && <div className="auth-message">{message}</div>}
        {error && <div className="auth-message error">{error}</div>}
      </div>
    </div>
  )
}
