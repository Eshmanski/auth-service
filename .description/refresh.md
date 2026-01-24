# Алгоритм обработки запроса (GET /api/refresh):

## 1. Поступление запроса

Поступает GET запрос на `/api/refresh`.

**Требования**: Запрос должен содержать cookie `refreshToken` для обновления токенов доступа.

## 2. Middleware обработка (до контроллера)

Запрос проходит через middleware:

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

**Важно**: Информация об устройстве используется для валидации сессии - устройство должно соответствовать сохраненной сессии.

## 3. Обработка в контроллере (`personController.refresh`)

### 3.1. Извлечение данных из запроса
- Извлекается информация об устройстве: `req.device`
- Извлекается `refreshToken` из cookies: `req.cookies.refreshToken`
- Если cookie отсутствует, `refreshToken` будет `undefined`

### 3.2. Валидация Refresh Token (`tokenService.validateRefreshToken`)
- Выполняется валидация refresh токена:
  - Используется `jwt.verify(token, JWT_REFRESH_SECRET)` для проверки токена
  - Проверяется подпись токена и срок его действия
  - Если токен валиден, возвращается payload с данными:
    - `id`: ID пользователя
    - `email`: email пользователя
    - `superuser`: статус суперпользователя
    - `isActivated`: статус активации аккаунта
    - `jti`: уникальный идентификатор сессии (JWT ID)
  - Если токен невалиден (истек, неверная подпись, отсутствует), возвращается `null`
- **Проверка наличия токена**:
  - Если `payload` равен `null`:
    - Выбрасывается `ApiError.UnauthorizedError('Don't have refresh token in cookies')`
    - Возвращается ответ со статусом **401** и кодом ошибки **3** (`unauthorized`)

### 3.3. Валидация сессии (`sessionService.validateSession`)
- Выполняется комплексная валидация сессии:
  - Параметры: `personId` (из payload), `jti` (из payload), `token` (refreshToken), `device` (информация об устройстве)
  - Получение сессии из Redis: `redisClient.getSession(personId, jti)`
  - Проверки:
    1. **Существование сессии**: Если сессия не найдена в Redis, добавляется ошибка `'Session not exist'`
    2. **Хеш токена**: Вычисляется хеш refresh токена через `toHashToken(token)` и сравнивается с `session.hash_token`. Если не совпадают, добавляется ошибка `'Hash are not equals'`
    3. **Тип устройства**: Сравнивается `session.device_type` с `device.device_type`. Если не совпадают, добавляется ошибка `'Device types are not equals'`
    4. **Название ОС**: Сравнивается `session.os_name` с `device.os_name`. Если не совпадают, добавляется ошибка `'OS names are not equals'`
    5. **Версия ОС**: Сравнивается `session.os_version` с `device.os_version`. Если не совпадают, добавляется ошибка `'OS versions are not equals'`
    6. **Название браузера**: Сравнивается `session.agent_name` с `device.agent_name`. Если не совпадают, добавляется ошибка `'Agent names are not equals'`
    7. **Версия браузера**: Сравнивается `session.agent_version` с `device.agent_version`. Если не совпадают, добавляется ошибка `'Agent versions are not equals'`
- Возвращается массив ошибок (пустой массив, если все проверки пройдены)
- **Проверка ошибок валидации**:
  - Если массив ошибок не пустой (`errors.length > 0`):
    - Выбрасывается `ApiError.UnauthorizedError(errors.join('\n'))`
    - Возвращается ответ со статусом **401** и кодом ошибки **3** (`unauthorized`)
    - В сообщении об ошибке перечисляются все найденные несоответствия

### 3.4. Получение пользователя (`personService.getPerson`)
- Выполняется получение данных пользователя из БД:
  - Используется `db.findPersonById(payload.id)`
  - Возвращается объект пользователя с актуальными данными

### 3.5. Генерация новых токенов (`tokenService.generateTokensPack`)
- Генерируется новый уникальный `jti` (JWT ID) через `uuid.v4()`
- Создаются payload для новых токенов:
  - **Access Token payload**: `PersonDTO.toPayloadAT(person)` - содержит `id`, `email`, `superuser`, `isActivated`
  - **Refresh Token payload**: `PersonDTO.toPayloadRT(jti, person)` - содержит те же поля + новый `jti`
- Генерируются новые токены:
  - **Access Token**: `jwt.sign(payloadAT, JWT_ACCESS_SECRET, { expiresIn: '1h' })` - срок действия 1 час
  - **Refresh Token**: `jwt.sign(payloadRT, JWT_REFRESH_SECRET, { expiresIn: '30d' })` - срок действия 30 дней
- Возвращается объект: `{ jti, accessToken, refreshToken }`

### 3.6. Создание новой сессии (`Session.createSession`)
- Вычисляется TTL для новой сессии: `30 * 24 * 60 * 60` секунд (30 дней)
- Создается новый объект сессии:
  - `jti`: новый уникальный идентификатор сессии
  - `hash_token`: хеш нового refresh токена через `toHashToken(refreshToken)`
  - `person_id`: ID пользователя
  - `device_type`, `agent_name`, `agent_version`, `os_name`, `os_version`, `ip_address`: информация об устройстве из текущего запроса
  - `createdAt`: текущая временная метка (timestamp в миллисекундах)

### 3.7. Сохранение новой сессии в Redis (`sessionService.saveSession`)
- Новая сессия сохраняется в Redis с TTL 30 дней
- Ключ сессии формируется на основе `person_id` и нового `jti`

### 3.8. Установка нового Refresh Token в Cookie
- Устанавливается HttpOnly cookie `refreshToken` с новым значением:
  - Значение: новый `refreshToken` (JWT токен)
  - `maxAge`: `30 * 24 * 60 * 60 * 1000` миллисекунд (30 дней)
  - `httpOnly: true` (недоступен через JavaScript)

### 3.9. Удаление старой сессии (`sessionService.removeSession`)
- Выполняется удаление старой сессии из Redis:
  - Используется `sessionService.removeSession(payload.id, payload.jti)`
  - Удаляется сессия с предыдущим `jti` (из старого refresh токена)
  - Это обеспечивает ротацию сессий и предотвращает повторное использование старых токенов

### 3.10. Формирование ответа
- Возвращается ответ со статусом **200 OK**
- Тело ответа:
```json
{
  "token": "string (новый JWT Access Token)"
}
```

## 4. Обработка ошибок

Если на любом этапе возникает ошибка:
- Ошибка передается в `next(error)`
- Обрабатывается через `errorApiMiddlewares`
- Возвращается соответствующий HTTP статус и код ошибки

### Возможные ошибки:
- **401** (код 3): Unauthorized - возникает в следующих случаях:
  - RefreshToken отсутствует в cookies
  - RefreshToken невалиден или истек
  - Сессия не найдена в Redis
  - Хеш токена не совпадает с сохраненным в сессии
  - Устройство не соответствует сохраненной сессии (любое из полей: device_type, os_name, os_version, agent_name, agent_version)

## 5. Особенности реализации

### 5.1. Ротация токенов и сессий
- При каждом refresh создается новая сессия с новым `jti`
- Старая сессия удаляется из Redis
- Это обеспечивает безопасность: если старый refresh токен был скомпрометирован, он становится недействительным после первого refresh

### 5.2. Строгая валидация устройства
- В отличие от logout, refresh требует полного соответствия устройства:
  - Тип устройства (desktop/mobile/tablet)
  - Название и версия ОС
  - Название и версия браузера
- Это предотвращает использование украденного refresh токена с другого устройства

### 5.3. Валидация хеша токена
- Проверяется соответствие хеша refresh токена с хешем, сохраненным в сессии
- Это предотвращает использование поддельных или измененных токенов

### 5.4. Обновление информации об устройстве
- При создании новой сессии используется актуальная информация об устройстве из текущего запроса
- Это позволяет обновлять данные об устройстве при каждом refresh

## Итоговая последовательность:

1. GET запрос → `/api/refresh`
2. Middleware: Device Info (извлечение информации об устройстве)
3. Контроллер: Извлечение refreshToken из cookies
4. Валидация refreshToken (если невалиден → 401)
5. Валидация сессии в Redis (проверка существования, хеша, устройства)
6. Проверка результатов валидации сессии (если есть ошибки → 401)
7. Получение пользователя из БД
8. Генерация новых токенов (Access + Refresh) и нового jti
9. Создание нового объекта сессии
10. Сохранение новой сессии в Redis (TTL 30 дней)
11. Установка нового Refresh Token в HttpOnly cookie
12. Удаление старой сессии из Redis
13. Возврат нового Access Token в ответе (200 OK)

## Сценарии использования:

### Сценарий 1: Успешный refresh
- RefreshToken присутствует и валиден
- Сессия найдена в Redis
- Все параметры устройства совпадают
- Хеш токена совпадает
- Старая сессия удалена, новая создана
- Новый refreshToken установлен в cookie
- Возвращается новый accessToken (200 OK)

### Сценарий 2: RefreshToken отсутствует
- RefreshToken отсутствует в cookies
- Возвращается 401 (код 3) с сообщением "Don't have refresh token in cookies"

### Сценарий 3: RefreshToken невалиден
- RefreshToken присутствует, но истек или имеет неверную подпись
- Возвращается 401 (код 3)

### Сценарий 4: Сессия не найдена
- RefreshToken валиден, но сессия не найдена в Redis
- Возвращается 401 (код 3) с ошибкой "Session not exist"

### Сценарий 5: Несоответствие устройства
- RefreshToken валиден, сессия найдена, но устройство не соответствует
- Возвращается 401 (код 3) с перечислением несоответствий (например, "Device types are not equals", "OS names are not equals")

### Сценарий 6: Несоответствие хеша токена
- RefreshToken валиден, сессия найдена, устройство соответствует, но хеш токена не совпадает
- Возвращается 401 (код 3) с ошибкой "Hash are not equals"
