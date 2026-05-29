import { useState } from 'react'
import { useAuth } from './auth/authContext.jsx'
import { LoginPage } from './auth/LoginPage.jsx'
import { ProfilePage } from './auth/ProfilePage.jsx'
import { RegisterPage } from './auth/RegisterPage.jsx'
import { TaskListPage } from './tasks/TaskListPage.jsx'
import './App.css'

function App() {
  const { currentUser, isAuthenticated, logout, authReady, authLoading } = useAuth()
  const [activeView, setActiveView] = useState('register')
  const visibleView = isAuthenticated
    ? activeView === 'register' || activeView === 'login'
      ? 'tasks'
      : activeView
    : activeView === 'tasks' || activeView === 'profile'
      ? 'login'
      : activeView

  const pages = {
    register: (
      <RegisterPage
        onSwitchToLogin={() => setActiveView('login')}
        onAuthSuccess={() => setActiveView('profile')}
      />
    ),
    login: (
      <LoginPage
        onSwitchToRegister={() => setActiveView('register')}
        onAuthSuccess={() => setActiveView('profile')}
      />
    ),
    profile: <ProfilePage key={currentUser?.id ?? 'profile'} />,
    tasks: <TaskListPage key={currentUser?.id ?? 'tasks'} />,
  }

  return (
    <main className="auth-app-shell">
      <section className="auth-hero">
        <div className="auth-hero__copy">
          <p className="eyebrow">Task Manager Client</p>
          <h1>Auth flow that feels like part of the product, not a demo.</h1>
          <p className="lead">
            Register, sign in, and edit your profile from one shared auth state.
            Everything persists locally so the flow behaves like a real app while
            staying self-contained.
          </p>
          <div className="auth-badges" aria-label="Auth capabilities">
            <span>Validation</span>
            <span>API session</span>
            <span>Profile editing</span>
            <span>Bearer or cookie auth</span>
          </div>
        </div>

        <aside className="auth-session-card" aria-live="polite">
          <p className="session-label">Current session</p>
          {!authReady ? (
            <>
              <strong>Restoring session</strong>
              <span>Checking the backend for an active login.</span>
            </>
          ) : isAuthenticated ? (
            <>
              <strong>{currentUser.username || currentUser.name}</strong>
              <span>{currentUser.email}</span>
              <span>{currentUser.company || 'No company set'}</span>
              <button type="button" className="ghost-button" onClick={logout}>
                {authLoading ? 'Signing out...' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <strong>No active session</strong>
              <span>Use the tabs below to register or sign in with the backend.</span>
            </>
          )}
        </aside>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__nav" role="tablist" aria-label="Auth pages">
          <button
            type="button"
            className={visibleView === 'register' ? 'tab is-active' : 'tab'}
            onClick={() => setActiveView('register')}
          >
            Register
          </button>
          <button
            type="button"
            className={visibleView === 'login' ? 'tab is-active' : 'tab'}
            onClick={() => setActiveView('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={visibleView === 'profile' ? 'tab is-active' : 'tab'}
            onClick={() => setActiveView('profile')}
          >
            Profile
          </button>
          <button
            type="button"
            className={visibleView === 'tasks' ? 'tab is-active' : 'tab'}
            onClick={() => setActiveView('tasks')}
          >
            Tasks
          </button>
        </div>

        <div className="auth-panel__body">{pages[visibleView]}</div>
      </section>
    </main>
  )
}

export default App
