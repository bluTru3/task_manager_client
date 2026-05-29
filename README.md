# Task Manager Client

This app includes a frontend auth flow wired to a backend API.

## Backend Contract

The frontend calls these endpoints by default:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `GET /api/auth/profile/` (`/api/auth/me/` also supported by backend)
- `PATCH /api/auth/profile/` (`/api/auth/me/` alias)
- `POST /api/auth/token/refresh/`

The API may return the user directly or nested under `user`, `profile`, `account`, or `data`.

JWT transport:

- Tokens are read from `access` and `refresh` response fields.
- Authenticated requests send `Authorization: Bearer <access>`.
- On `401`, protected requests rotate the access token with the refresh token and retry once.

## Environment

Set the API base URL in `.env`:

```bash
VITE_AUTH_API_BASE_URL=http://127.0.0.1:8000
```

You can override endpoint paths if your backend uses different routes:

```bash
VITE_AUTH_REGISTER_PATH=/api/auth/register/
VITE_AUTH_LOGIN_PATH=/api/auth/login/
VITE_AUTH_ME_PATH=/api/auth/profile/
VITE_AUTH_REFRESH_PATH=/api/auth/token/refresh/
```

## Development

- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`
