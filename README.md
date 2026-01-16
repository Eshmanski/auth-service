# Environment

| Variable | Description |
|----------|-------------|
| `PORT` | The port to run the server on |
| `DB_PGS_USER` | The username for the postgres database |
| `DB_PGS_PASSWORD` | The password for the postgres database |
| `DB_PGS_HOST` | The host for the postgres database |
| `DB_PGS_PORT` | The port for the postgres database |
| `DB_PGS_NAME` | The name of the postgres database |
| `DB_REDIS_HOST` | The host for the redis database |
| `DB_REDIS_PORT` | The port for the redis database |
| `JWT_ACCESS_SECRET` | The secret key for the JWT token |
| `JWT_REFRESH_SECRET` | The secret key for the JWT token |
| `CLIENT_URL` | The URL of the client |

## Example env file
```
PORT=

DB_PGS_USER=
DB_PGS_PASSWORD=
DB_PGS_HOST=
DB_PGS_PORT=
DB_PGS_NAME=

DB_REDIS_HOST=
DB_REDIS_PORT=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

CLIENT_URL=
```
# End Points

### GET  .../api/check

#### Requirements:
- Auth - FALSE

#### Return: 

Message "Auth service is working"

### POST  .../api/registration


#### Requirements:
- Auth - FALSE

#### Body:

```
{
    email: string,
    password: string,
}
```

#### Response:

```
{
    token: string   // Access Token
}
```

#### Additional:
- Add cookie HttpOnly Refresh Token
- Send Email with activation link