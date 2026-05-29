import { useState } from 'react'
import { useAuth } from './authContext.js'

function validate(values) {
  const nextErrors = {}

  if (!values.username.trim()) {
    nextErrors.username = 'Username is required.'
  }

  if (!values.password) {
    nextErrors.password = 'Password is required.'
  }

  return nextErrors
}

export function LoginPage({ onSwitchToRegister, onAuthSuccess }) {
  const { login, authError, setAuthError, authLoading } = useAuth()
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    }

    setSuccessMessage('')
    setAuthError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(formValues)
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      await login(formValues)
      setSuccessMessage('You are signed in and ready to update your profile.')
      onAuthSuccess?.()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign in failed.')
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to continue.</h2>
        <p>
          Login errors are surfaced from the auth provider, so wrong credentials
          and unknown accounts are handled in one place.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              value={formValues.username}
              onChange={handleChange}
            />
            {fieldErrors.username ? <span className="field-error">{fieldErrors.username}</span> : null}
          </div>

          <div className="form-row">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formValues.password}
              onChange={handleChange}
            />
            {fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}
          </div>

          {authError ? <div className="form-alert">{authError}</div> : null}
          {successMessage ? <div className="form-success">{successMessage}</div> : null}

          <div className="auth-actions">
            <button type="submit" className="primary-button" disabled={authLoading}>
              {authLoading ? 'Signing in...' : 'Sign in'}
            </button>
            <button type="button" className="secondary-button" onClick={onSwitchToRegister}>
              Create a new account
            </button>
          </div>
        </form>
      </section>

      <aside className="auth-side">
        <h3>Need a quick test account?</h3>
        <p>
          Demo username: <strong>spec1780011305</strong>
        </p>
        <p>
          Demo password: <strong>StrongPass123x</strong>
        </p>
        <div className="profile-summary">
          <span className="meta-pill">Error handling</span>
          <span className="meta-pill">Inline feedback</span>
          <span className="meta-pill">Context-driven session state</span>
        </div>
      </aside>
    </div>
  )
}
