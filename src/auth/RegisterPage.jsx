import { useState } from 'react'
import { useAuth } from './authContext.js'

function validate(values) {
  const nextErrors = {}

  if (!values.username.trim()) {
    nextErrors.username = 'Username is required.'
  }

  if (!values.name.trim()) {
    nextErrors.name = 'Name is required.'
  }

  if (!values.email.trim()) {
    nextErrors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    nextErrors.email = 'Enter a valid email address.'
  }

  if (values.password.length < 8) {
    nextErrors.password = 'Use at least 8 characters.'
  }

  if (!/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password)) {
    nextErrors.password = 'Include at least one capital letter and one number.'
  }

  if (values.password !== values.confirmPassword) {
    nextErrors.confirmPassword = 'Passwords do not match.'
  }

  return nextErrors
}

export function RegisterPage({ onSwitchToLogin, onAuthSuccess }) {
  const { register, setAuthError, authLoading } = useAuth()
  const [formValues, setFormValues] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    }

    setStatusMessage('')
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
      await register({
        username: formValues.username,
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
      })
      setStatusMessage('Account created. Your profile is now active.')
      onAuthSuccess?.()
      setFormValues({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Could not create account.')
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Create account</p>
        <h2>Start a new workspace profile.</h2>
        <p>
          Use a proper name, a valid email, and a strong password. Validation
          happens before submit, and the provider rejects duplicate accounts.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              name="username"
              type="text"
              autoComplete="username"
              value={formValues.username}
              onChange={handleChange}
            />
            {fieldErrors.username ? <span className="field-error">{fieldErrors.username}</span> : null}
          </div>

          <div className="form-row">
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              value={formValues.name}
              onChange={handleChange}
            />
            {fieldErrors.name ? <span className="field-error">{fieldErrors.name}</span> : null}
          </div>

          <div className="form-row">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              value={formValues.email}
              onChange={handleChange}
            />
            {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
          </div>

          <div className="form-row">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formValues.password}
              onChange={handleChange}
            />
            {fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}
          </div>

          <div className="form-row">
            <label htmlFor="register-confirm-password">Confirm password</label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formValues.confirmPassword}
              onChange={handleChange}
            />
            {fieldErrors.confirmPassword ? (
              <span className="field-error">{fieldErrors.confirmPassword}</span>
            ) : null}
          </div>

          {statusMessage ? <div className="form-success">{statusMessage}</div> : null}

          <div className="auth-actions">
            <button type="submit" className="primary-button" disabled={authLoading}>
              {authLoading ? 'Creating...' : 'Create account'}
            </button>
            <button type="button" className="secondary-button" onClick={onSwitchToLogin}>
              I already have an account
            </button>
          </div>
        </form>
      </section>

      <aside className="auth-side">
        <h3>What happens after registration?</h3>
        <p>
          The account is stored in the auth provider, the current session is set,
          and the profile page can be edited immediately.
        </p>
        <div className="profile-summary">
          <span className="meta-pill">Live validation</span>
          <span className="meta-pill">Duplicate email guard</span>
          <span className="meta-pill">Auto-login on success</span>
        </div>
      </aside>
    </div>
  )
}
