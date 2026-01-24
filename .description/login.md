# Алгоритм обработки запроса (POST /api/login):

## 1. Поступление запроса

Поступает POST запрос на `/api/login` с телом:
```json
{
  "email": "example@mail.com",
  "password": "123456"
}
```

## 2. Middleware обработка (до контроллера)

Запрос проходит через последовательность middleware в следующем порядке:

### 2.1. Device Info Middleware (`deviceInfoMiddleware`)
Извлекается информация об устройстве, с которого поступил запрос:
- **IP адрес**: извлекается из заголовка `x-forwarded-for` или `req.socket.remoteAddress`
- **Тип устройства**: определяется как `mobile`, `tablet` или `desktop` на основе `req.useragent`
- **Информация о браузере**: парсится из `User-Agent` через `device-detector-js`
  - `agent_name`: название браузера (например, "Chrome", "Firefox")
  - `agent_version`: версия браузера
- **Информация об ОС**: парсится из `User-Agent`
  - `os_name`: название операционной системы
  - `os_version`: версия операционной системы

Результат сохраняется в `req.device`:
```js
{
  device_type: "desktop" | "mobile" | "tablet",
  agent_name: "string",
  agent_version: "string",
  os_name: "string",
  os_version: "string",
  ip_address: "string"
}
```

### 2.2. Email Lowercase Middleware (`emailToLowerCase`)
Свойство `email` в `req.body` приводится к нижнему регистру (`toLowerCase()`).

### 2.3. Валидация (`express-validator`)
- **Email**: проверяется формат email через `body('email').isEmail()`
- **Password**: проверяется длина строки от 6 до 32 символов через `body('password').isLength({ min: 6, max: 32 })`

## 3. Обработка в контроллере (`personController.login`)

### 3.1. Проверка результатов валидации
- Используется `validationResult(req)` для получения ошибок валидации
- Если есть ошибки валидации:
  - Вызывается `ApiError.ValidationError(errors.array())`
  - Возвращается ответ со статусом **400** и кодом ошибки **2** (`validation_error`)
  - В теле ответа передается массив ошибок валидации

### 3.2. Аутентификация пользователя (`personService.login`)
- Извлекаются `body` (email, password) и `device` из запроса
- Выполняется поиск пользователя в БД:
  - Выполняется запрос в БД: `db.findPersonByEmail(authData.email)`
  - Если пользователь с таким email не найден:
    - Выбрасывается `ApiError.PersonNotExistError()`
    - Возвращается ответ со статусом **404** и кодом ошибки **5** (`not_exist`)
- Проверка пароля:
  - Выполняется сравнение пароля через `bcrypt.compare(authData.password, person.password)`
  - Сравнивается введенный пароль (plain text) с хешированным паролем из БД
  - Если пароли не совпадают:
    - Выбрасывается `ApiError.WrongPasswordError()`
    - Возвращается ответ со статусом **401** и кодом ошибки **4** (`wrong_password`)
- Если все проверки пройдены, возвращается объект пользователя из БД

### 3.3. Генерация токенов (`tokenService.generateTokensPack`)
- Генерируется уникальный `jti` (JWT ID) через `uuid.v4()`
- Создаются payload для токенов:
  - **Access Token payload**: `PersonDTO.toPayloadAT(person)` - содержит `id`, `email`, `superuser`, `isActivated`
  - **Refresh Token payload**: `PersonDTO.toPayloadRT(jti, person)` - содержит те же поля + `jti`
- Генерируются токены:
  - **Access Token**: `jwt.sign(payloadAT, JWT_ACCESS_SECRET, { expiresIn: '1h' })` - срок действия 1 час
  - **Refresh Token**: `jwt.sign(payloadRT, JWT_REFRESH_SECRET, { expiresIn: '30d' })` - срок действия 30 дней
- Возвращается объект: `{ jti, accessToken, refreshToken }`

### 3.4. Создание сессии (`Session.createSession`)
- Вычисляется TTL для сессии: `30 * 24 * 60 * 60` секунд (30 дней)
- Создается объект сессии:
  - `jti`: уникальный идентификатор сессии
  - `hash_token`: хеш refresh токена через `toHashToken(refreshToken)`
  - `person_id`: ID пользователя
  - `device_type`, `agent_name`, `agent_version`, `os_name`, `os_version`, `ip_address`: информация об устройстве
  - `createdAt`: текущая временная метка (timestamp в миллисекундах)

### 3.5. Сохранение сессии в Redis (`sessionService.saveSession`)
- Сессия сохраняется в Redis с TTL 30 дней
- Ключ сессии формируется на основе `person_id` и `jti`

### 3.6. Установка Refresh Token в Cookie
- Устанавливается HttpOnly cookie `refreshToken`:
  - Значение: `refreshToken` (JWT токен)
  - `maxAge`: `30 * 24 * 60 * 60 * 1000` миллисекунд (30 дней)
  - `httpOnly: true` (недоступен через JavaScript)

### 3.7. Формирование ответа
- Возвращается ответ со статусом **200 OK**
- Тело ответа:
```json
{
  "token": "string (JWT Access Token)"
}
```

## 4. Обработка ошибок

Если на любом этапе возникает ошибка:
- Ошибка передается в `next(error)`
- Обрабатывается через `errorApiMiddlewares`
- Возвращается соответствующий HTTP статус и код ошибки

### Возможные ошибки:
- **400** (код 2): Ошибка валидации - неверный формат email или длина пароля
- **404** (код 5): Пользователь не найден - email не существует в БД
- **401** (код 4): Неверный пароль - пароль не совпадает с сохраненным в БД

## Итоговая последовательность:

1. POST запрос → `/api/login`
2. Middleware: Device Info → Email Lowercase → Validation
3. Контроллер: Проверка валидации
4. Поиск пользователя в БД по email
5. Проверка существования пользователя (если не найден → 404)
6. Проверка пароля через bcrypt.compare (если неверный → 401)
7. Генерация токенов (Access + Refresh) и jti
8. Создание объекта сессии
9. Сохранение сессии в Redis (TTL 30 дней)
10. Установка Refresh Token в HttpOnly cookie
11. Возврат Access Token в ответе (200 OK)
