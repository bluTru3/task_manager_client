const DEFAULT_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL?.trim() ?? ''

const ENDPOINTS = {
  register: import.meta.env.VITE_AUTH_REGISTER_PATH?.trim() || '/api/auth/register/',
  login: import.meta.env.VITE_AUTH_LOGIN_PATH?.trim() || '/api/auth/login/',
  me: import.meta.env.VITE_AUTH_ME_PATH?.trim() || '/api/auth/profile/',
  refresh: import.meta.env.VITE_AUTH_REFRESH_PATH?.trim() || '/api/auth/token/refresh/',
  tasks: import.meta.env.VITE_TASKS_PATH?.trim() || '/api/tasks/',
}

export class AuthApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.payload = payload
  }
}

function joinUrl(baseUrl, path) {
  if (!baseUrl) {
    return path
  }

  return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
}

async function readResponseBody(response) {
  const contentType = response.headers.get('content-type') || ''

  if (response.status === 204) {
    return null
  }

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

function unwrapUser(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  return payload.user ?? payload.account ?? payload.profile ?? payload.data?.user ?? payload.data ?? payload
}

function extractTokens(payload) {
  if (!payload || typeof payload !== 'object') {
    return { accessToken: '', refreshToken: '' }
  }

  return {
    accessToken:
      payload.access ??
      payload.token ??
      payload.accessToken ??
      payload.jwt ??
      payload.idToken ??
      payload.data?.access ??
      payload.data?.token ??
      '',
    refreshToken: payload.refresh ?? payload.refreshToken ?? payload.data?.refresh ?? '',
  }
}

function flattenValidationErrors(payload) {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const parts = Object.entries(payload)
    .filter(([key]) => !['detail', 'message', 'error'].includes(key))
    .map(([key, value]) => {
      const asText = Array.isArray(value) ? value.join(', ') : String(value)
      return `${key}: ${asText}`
    })

  return parts.join(' | ')
}

function getErrorMessage(payload, response) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    return (
      payload.message ||
      payload.error ||
      payload.detail ||
      flattenValidationErrors(payload) ||
      `Request failed with status ${response.status}`
    )
  }

  return `Request failed with status ${response.status}`
}

async function requestJson(path, { method = 'GET', token = '', body } = {}) {
  const response = await fetch(joinUrl(DEFAULT_BASE_URL, path), {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await readResponseBody(response)

  if (!response.ok) {
    throw new AuthApiError(getErrorMessage(payload, response), response.status, payload)
  }

  return payload
}

function normalizeUser(user) {
  if (!user || typeof user !== 'object') {
    return null
  }

  return {
    id: user.id ?? user._id ?? user.userId ?? '',
    name: user.name ?? user.fullName ?? user.displayName ?? user.username ?? '',
    username: user.username ?? '',
    email: user.email ?? '',
    bio: user.bio ?? '',
    company: user.company ?? '',
    avatarUrl: user.profile_image ?? user.avatarUrl ?? user.avatar_url ?? '',
    updatedAt: user.updatedAt ?? user.updated_at ?? new Date().toISOString(),
  }
}

function toTaskArray(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.results)) {
      return payload.results
    }

    if (Array.isArray(payload.data)) {
      return payload.data
    }
  }

  return []
}

function normalizeTask(task) {
  return {
    id: task.id,
    title: task.title || 'Untitled task',
    description: task.description || '',
    status: task.status || 'TODO',
    priority: task.priority || 'LOW',
    dueDate: task.due_date || task.dueDate || '',
    createdAt: task.created_at || task.createdAt || '',
  }
}

function normalizeSessionResponse(payload) {
  const user = normalizeUser(unwrapUser(payload))
  const tokens = extractTokens(payload)

  return {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

function normalizeRequiredUserResponse(payload) {
  const session = normalizeSessionResponse(payload)

  if (!session.user) {
    throw new Error('The auth API did not return a user object.')
  }

  return session
}

export function isApiErrorWithStatus(error, expectedStatus) {
  return error instanceof AuthApiError && error.status === expectedStatus
}

export async function fetchCurrentUser(token = '') {
  const payload = await requestJson(ENDPOINTS.me, { token })
  return normalizeRequiredUserResponse(payload)
}

export async function registerUser(profile) {
  const payload = await requestJson(ENDPOINTS.register, {
    method: 'POST',
    body: {
      username: profile.username,
      email: profile.email,
      password: profile.password,
      password_confirm: profile.password_confirm,
    },
  })

  return normalizeSessionResponse(payload)
}

export async function loginUser(credentials) {
  const payload = await requestJson(ENDPOINTS.login, {
    method: 'POST',
    body: credentials,
  })

  return normalizeSessionResponse(payload)
}

export async function updateCurrentUser(updates, token = '') {
  const payload = await requestJson(ENDPOINTS.me, {
    method: 'PATCH',
    token,
    body: {
      bio: updates.bio ?? '',
      company: updates.company ?? '',
    },
  })

  return normalizeRequiredUserResponse(payload)
}

export async function refreshAccessToken(refreshToken) {
  const payload = await requestJson(ENDPOINTS.refresh, {
    method: 'POST',
    body: {
      refresh: refreshToken,
    },
  })

  const tokens = extractTokens(payload)

  if (!tokens.accessToken) {
    throw new Error('Refresh endpoint did not return an access token.')
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

export async function fetchTasks(filters, token = '') {
  const params = new URLSearchParams()

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params.set(key, String(value).trim())
    }
  })

  const query = params.toString()
  const path = query ? `${ENDPOINTS.tasks}?${query}` : ENDPOINTS.tasks
  const payload = await requestJson(path, { token })

  return {
    items: toTaskArray(payload).map(normalizeTask),
    count: payload?.count ?? toTaskArray(payload).length,
    raw: payload,
  }
}