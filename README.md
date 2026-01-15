# Environment

| Variable | Description |
|----------|-------------|
| `PORT` | The port to run the server on |
| `DB_USER` | The username for the database |
| `DB_PASSWORD` | The password for the database |
| `DB_HOST` | The host for the database |
| `DB_PORT` | The port for the database |
| `DB_NAME` | The name of the database |
| `JWT_ACCESS_SECRET` | The secret key for the JWT token |
| `JWT_REFRESH_SECRET` | The secret key for the JWT token |
| `SMTP_HOST` | The host for the SMTP server |
| `SMTP_PORT` | The port for the SMTP server |
| `SMTP_USER` | The username for the SMTP server |
| `SMTP_PASSWORD` | The password for the SMTP server |
| `API_URL` | The URL of the API |
| `CLIENT_URL` | The URL of the client |

## Example env file
```
PORT=

DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_NAME=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

API_URL=
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