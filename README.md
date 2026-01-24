# Table of Contents

- [Environment](#environment)
  - [Example env file](#example-env-file)
- [End Points](#end-points)
  - [GET `/api/check`](#get-apicheck)
  - [POST `/api/registration`](#post-apiregistration)
  - [POST `/api/login`](#post-apilogin)
  - [GET `/api/logout`](#get-apilogout)
  - [GET `/api/refresh`](#get-apirefresh)
  - [GET `/api/activate/:link`](#get-apiactivatelink)
  - [GET `/api/me`](#get-apime)
  - [GET `/api/persons`](#get-apipersons)

---

# Environment

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BASE_PATH` | Base path for the application | `/` | No |
| `PORT` | The port to run the server on | `5000` | No |
| `DB_PGS_USER` | The username for the postgres database | - | Yes |
| `DB_PGS_PASSWORD` | The password for the postgres database | - | Yes |
| `DB_PGS_HOST` | The host for the postgres database | - | Yes |
| `DB_PGS_PORT` | The port for the postgres database | - | Yes |
| `DB_PGS_NAME` | The name of the postgres database | - | Yes |
| `DB_REDIS_USER` | The username for the redis database | - | No |
| `DB_REDIS_PASSWORD` | The password for the redis database | - | No |
| `DB_REDIS_HOST` | The host for the redis database | - | Yes |
| `DB_REDIS_PORT` | The port for the redis database | - | Yes |
| `JWT_ACCESS_SECRET` | The secret key for the JWT access token | - | Yes |
| `JWT_REFRESH_SECRET` | The secret key for the JWT refresh token | - | Yes |
| `CLIENT_URL` | The URL of the client application | - | Yes |

### Example env file
```
BASE_PATH=
PORT=

DB_PGS_USER=
DB_PGS_PASSWORD=
DB_PGS_HOST=
DB_PGS_PORT=
DB_PGS_NAME=

DB_REDIS_USER=
DB_REDIS_PASSWORD=
DB_REDIS_HOST=
DB_REDIS_PORT=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

CLIENT_URL=
```

# End Points

### GET `/api/check`

Health check endpoint to verify the service is running.

#### Requirements:
- **Auth**: Not required

#### Request:
- No body or parameters required

#### Response:
- **Status**: `200 OK`
- **Body**: `"Auth service is working"` (plain text)

---

### POST `/api/registration`

Register a new user account.

#### Requirements:
- **Auth**: Not required

#### Request Body:
```json
{
    "email": "string (valid email format)",
    "password": "string (6-32 characters)"
}
```

#### Response:
- **Status**: `200 OK`
- **Body**:
```json
{
    "token": "string (JWT Access Token)"
}
```

#### Additional:
- Sets `refreshToken` as HttpOnly cookie (valid for 30 days)
- Creates a new session in Redis

---

### POST `/api/login`

Authenticate an existing user and create a session.

#### Requirements:
- **Auth**: Not required

#### Request Body:
```json
{
    "email": "string (valid email format)",
    "password": "string (6-32 characters)"
}
```

#### Response:
- **Status**: `200 OK`
- **Body**:
```json
{
    "token": "string (JWT Access Token)"
}
```

#### Additional:
- Sets `refreshToken` as HttpOnly cookie (valid for 30 days)
- Creates a new session in Redis

---

### GET `/api/logout`

Logout the current user and invalidate the session.

#### Requirements:
- **Auth**: Not required (but requires `refreshToken` cookie)

#### Request:
- Requires `refreshToken` cookie

#### Response:
- **Status**: `204 No Content`
- **Body**: Empty

#### Additional:
- Removes `refreshToken` cookie
- Deletes session from Redis

---

### GET `/api/refresh`

Refresh the access token using the refresh token.

#### Requirements:
- **Auth**: Not required (but requires `refreshToken` cookie)

#### Request:
- Requires `refreshToken` cookie

#### Response:
- **Status**: `200 OK`
- **Body**:
```json
{
    "token": "string (new JWT Access Token)"
}
```

#### Additional:
- Sets new `refreshToken` as HttpOnly cookie (valid for 30 days)
- Creates a new session and removes the old one from Redis

---

### GET `/api/activate/:link`

Activate a user account using the activation link sent via email.

#### Requirements:
- **Auth**: Not required

#### Request Parameters:
- `link` (path parameter): Activation link string

#### Response:
- **Status**: `204 No Content`
- **Body**: Empty

#### Additional:
- Activates the user account in the database
- Clears the activation link

---

### GET `/api/me`

Get the current authenticated user's information.

#### Requirements:
- **Auth**: Required (Access Token in Authorization header)

#### Request:
- Requires `Authorization` header with Bearer token

#### Response:
- **Status**: `200 OK`
- **Body**: User object
```json
{
    "id": "number",
    "email": "string",
    "password": "string (hashed)",
    "is_activated": "boolean",
    "activation_link": "string",
    // ... other user fields
}
```

---

### GET `/api/persons`

Get a list of all persons (users) in the system.

#### Requirements:
- **Auth**: Required (Access Token in Authorization header)

#### Request:
- Requires `Authorization` header with Bearer token

#### Response:
- **Status**: `200 OK`
- **Body**: Array of user objects
```json
[
    {
        "id": "number",
        "email": "string",
        "password": "string (hashed)",
        "is_activated": "boolean",
        "activation_link": "string",
        // ... other user fields
    },
    // ... more users
]
```