import { useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from './authContext.js'
import {
  fetchCurrentUser,
  fetchTasks,
  isApiErrorWithStatus,
  loginUser,
  refreshAccessToken,
  registerUser,
  updateCurrentUser,
} from './authApi.js'

const ACCESS_TOKEN_KEY = 'task-manager-client:auth-access-token'
const REFRESH_TOKEN_KEY = 'task-manager-client:auth-refresh-token'

function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallback
  } catch {
    return fallback
  }
}

function createUserProfile({ name, username, email, password, confirmPassword }) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = (username || name).trim()

  return {
    username: normalizedUsername,
    name: name.trim(),
    email: normalizedEmail,
    password,
    password_confirm: confirmPassword || password,
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [accessToken, setAccessToken] = useState(() => readStorage(ACCESS_TOKEN_KEY, ''))
  const [refreshToken, setRefreshToken] = useState(() => readStorage(REFRESH_TOKEN_KEY, ''))
  const bootstrapTokenRef = useRef(accessToken)
  const bootstrapRefreshRef = useRef(refreshToken)
  const [authReady, setAuthReady] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (accessToken) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(accessToken))
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  }, [accessToken])

  useEffect(() => {
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(refreshToken))
    } else {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  }, [refreshToken])

  useEffect(() => {
    let active = true

    async function loadSession() {
      setAuthLoading(true)

      try {
        let session

        try {
          session = await fetchCurrentUser(bootstrapTokenRef.current)
        } catch (error) {
          if (!isApiErrorWithStatus(error, 401) || !bootstrapRefreshRef.current) {
            throw error
          }

          const rotatedTokens = await refreshAccessToken(bootstrapRefreshRef.current)
          const nextAccessToken = rotatedTokens.accessToken
          const nextRefreshToken = rotatedTokens.refreshToken || bootstrapRefreshRef.current

          session = await fetchCurrentUser(nextAccessToken)

          if (!active) {
            return
          }

          setAccessToken(nextAccessToken)
          setRefreshToken(nextRefreshToken)
        }

        if (!active) {
          return
        }

        setCurrentUser(session.user)
        setAccessToken(session.accessToken || bootstrapTokenRef.current)
        setRefreshToken(session.refreshToken || bootstrapRefreshRef.current)
        setAuthError('')
      } catch {
        if (!active) {
          return
        }

        setCurrentUser(null)
        setAccessToken('')
        setRefreshToken('')
      } finally {
        if (active) {
          setAuthLoading(false)
          setAuthReady(true)
        }
      }
    }

    loadSession()

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(() => {
    async function withTokenRotation(requestWithAccessToken) {
      try {
        return await requestWithAccessToken(accessToken)
      } catch (error) {
        if (!isApiErrorWithStatus(error, 401) || !refreshToken) {
          throw error
        }

        const rotatedTokens = await refreshAccessToken(refreshToken)
        const nextAccessToken = rotatedTokens.accessToken
        const nextRefreshToken = rotatedTokens.refreshToken || refreshToken

        setAccessToken(nextAccessToken)
        setRefreshToken(nextRefreshToken)

        return requestWithAccessToken(nextAccessToken)
      }
    }

    async function register(profile) {
      setAuthLoading(true)

      try {
        const session = await registerUser(createUserProfile(profile))
        let resolvedUser = session.user

        if (!resolvedUser && session.accessToken) {
          const meSession = await fetchCurrentUser(session.accessToken)
          resolvedUser = meSession.user
        }

        if (!resolvedUser) {
          throw new Error('Registration succeeded but no user profile was returned.')
        }

        setCurrentUser(resolvedUser)
        setAccessToken(session.accessToken)
        setRefreshToken(session.refreshToken)
        setAuthError('')

        return resolvedUser
      } finally {
        setAuthLoading(false)
      }
    }

    async function login(credentials) {
      setAuthLoading(true)

      try {
        const session = await loginUser({
          username: credentials.username.trim(),
          password: credentials.password,
        })
        let resolvedUser = session.user

        if (!resolvedUser && session.accessToken) {
          const meSession = await fetchCurrentUser(session.accessToken)
          resolvedUser = meSession.user
        }

        if (!resolvedUser) {
          throw new Error('Login succeeded but no user profile was returned.')
        }

        setCurrentUser(resolvedUser)
        setAccessToken(session.accessToken)
        setRefreshToken(session.refreshToken)
        setAuthError('')

        return resolvedUser
      } finally {
        setAuthLoading(false)
      }
    }

    function logout() {
      setCurrentUser(null)
      setAccessToken('')
      setRefreshToken('')
      setAuthError('')
    }

    async function updateProfile(updates) {
      if (!currentUser) {
        throw new Error('You must be signed in to update your profile.')
      }

      setAuthLoading(true)

      try {
        const session = await withTokenRotation((token) => updateCurrentUser(updates, token))
        setCurrentUser(session.user)
        setAccessToken(session.accessToken || accessToken)
        setRefreshToken(session.refreshToken || refreshToken)
        setAuthError('')

        return session.user
      } finally {
        setAuthLoading(false)
      }
    }

    async function listTasks(filters) {
      if (!currentUser) {
        throw new Error('You must be signed in to fetch tasks.')
      }

      return withTokenRotation((token) => fetchTasks(filters, token))
    }

    return {
      currentUser,
      isAuthenticated: Boolean(currentUser),
      authReady,
      authLoading,
      authError,
      setAuthError,
      register,
      login,
      logout,
      updateProfile,
      listTasks,
    }
  }, [accessToken, authError, authLoading, authReady, currentUser, refreshToken])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
