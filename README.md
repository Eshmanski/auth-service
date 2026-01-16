# Environment

| Variable | Description |
|----------|-------------|
| `PORT` | The port to run the server on |
| `DB_PGS_USER` | The username for the database |
| `DB_PGS_PASSWORD` | The password for the database |
| `DB_PGS_HOST` | The host for the database |
| `DB_PGS_PORT` | The port for the database |
| `DB_PGS_NAME` | The name of the database |
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