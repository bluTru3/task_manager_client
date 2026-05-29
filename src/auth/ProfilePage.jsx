import { useState } from 'react'
import { useAuth } from './authContext.js'

function validate(values) {
  const nextErrors = {}

  if (values.bio.length > 500) {
    nextErrors.bio = 'Bio must be 500 characters or less.'
  }

  return nextErrors
}

export function ProfilePage() {
  const { currentUser, isAuthenticated, updateProfile, setAuthError, authError, authLoading } = useAuth()
  const [formValues, setFormValues] = useState(() => ({
    bio: currentUser?.bio ?? '',
    company: currentUser?.company ?? '',
  }))
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
      const nextUser = await updateProfile(formValues)
      setFormValues({
        bio: nextUser.bio ?? '',
        company: nextUser.company ?? '',
      })
      setStatusMessage('Profile saved successfully.')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not update profile.')
    }
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="auth-page">
        <section className="auth-card">
          <p className="eyebrow">Profile</p>
          <h2>You are not signed in.</h2>
          <p>
            Register or log in first to view and edit the profile state managed by
            the auth provider.
          </p>
        </section>

        <aside className="auth-side">
          <h3>Why this matters</h3>
          <p>The same context powers login, registration, and profile updates.</p>
          <div className="profile-summary">
            <span className="meta-pill">Shared state</span>
            <span className="meta-pill">Persisted session</span>
            <span className="meta-pill">Editable profile</span>
          </div>
        </aside>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Profile</p>
        <h2>View and edit your profile.</h2>
        <p>
          Changes are written back to the auth context, so the header session card
          updates immediately.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <label htmlFor="profile-username">Username</label>
            <input
              id="profile-username"
              name="username"
              type="text"
              value={currentUser.username || ''}
              readOnly
            />
          </div>

          <div className="form-row">
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              name="email"
              type="email"
              autoComplete="email"
              value={currentUser.email || ''}
              readOnly
            />
          </div>

          <div className="form-row">
            <label htmlFor="profile-company">Company</label>
            <input
              id="profile-company"
              name="company"
              type="text"
              value={formValues.company}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="profile-bio">Bio</label>
            <textarea id="profile-bio" name="bio" value={formValues.bio} onChange={handleChange} />
            {fieldErrors.bio ? <span className="field-error">{fieldErrors.bio}</span> : null}
          </div>

          {authError ? <div className="form-alert">{authError}</div> : null}
          {statusMessage ? <div className="form-success">{statusMessage}</div> : null}

          <div className="auth-actions">
            <button type="submit" className="primary-button" disabled={authLoading}>
              {authLoading ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setFormValues({
                  bio: currentUser.bio ?? '',
                  company: currentUser.company ?? '',
                })
              }
            >
              Reset form
            </button>
          </div>
        </form>
      </section>

      <aside className="auth-side">
        <h3>Profile snapshot</h3>
        <div className="profile-summary">
          <strong>{currentUser.username || currentUser.name}</strong>
          <span>{currentUser.email}</span>
          <dl className="meta-list">
            <div className="meta-item">
              <dt>Company</dt>
              <dd>{currentUser.company || 'Unset'}</dd>
            </div>
            <div className="meta-item">
              <dt>Last updated</dt>
              <dd>{currentUser.updatedAt ? new Date(currentUser.updatedAt).toLocaleString() : 'Now'}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  )
}
