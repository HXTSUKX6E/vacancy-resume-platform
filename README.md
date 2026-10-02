# Microservice HSE Project

Монорепозиторий с микросервисной системой для платформы вакансий/резюме.

## Состав проекта

- **auth-service** (Spring Boot, порт `8080`) — регистрация, авторизация, JWT, профиль, восстановление пароля, работа с резюме и изображениями резюме.
- **company-vacancy-service** (Spring Boot, порт `8083`) — компании, вакансии, отклики.
- **notification-service** (Spring Boot, порт `8081`) — email-уведомления, потребляет события из Kafka.
- **nginx** (порт `80`) — единая точка входа: `/api/*` → backend, остальное → frontend.
- **frontend/my-app** (Next.js) — веб-интерфейс.
- Инфраструктура: **PostgreSQL (2 БД), Redis, Kafka (KRaft)**; опционально **Graylog + Elasticsearch + MongoDB, pgAdmin** (`docker-compose.observability.yml`).

## Архитектура и взаимодействие

1. Клиент обращается в `nginx`.
2. `nginx` отдаёт фронтенд и проксирует запросы к API:
   - `/api/auth/*` и `/api/user/*` → `auth-service`
   - `/api/comp-vac/*` → `company-vacancy-service`
3. `auth-service` и `company-vacancy-service` работают с PostgreSQL и JWT.
4. Сервисы публикуют события в Kafka (регистрация, смена email, отклики).
5. `notification-service` подписывается на Kafka-топики и отправляет email.
6. Redis используется для хранения служебных данных (например, blacklist токенов).

## Основные API

### Auth Service (`/api/auth`)

- `POST /api/auth/register` — регистрация.
- `GET /api/auth/confirm?token=...` — подтверждение аккаунта.
- `POST /api/auth/login` — вход.
- `POST /api/auth/logout` — выход.
- `GET /api/auth/profile` — получить профиль текущего пользователя.
- `PUT /api/auth/profile` — обновить профиль.
- `PUT /api/auth/profile/change-login` — смена email/login.
- `GET /api/auth/confirm-email-change?token=...` — подтверждение смены email.
- `POST /api/auth/forgot-password` — запрос восстановления пароля.
- `POST /api/auth/confirm-reset-password?token=...` — установка нового пароля.

### Resume API (`/api/user`)

- `POST /api/user/resume` — создать резюме.
- `GET /api/user/resume/{id}` — получить резюме.
- `GET /api/user/resume` — список резюме (роль-зависимо).
- `PUT /api/user/resume/{id}` — обновить резюме.
- `DELETE /api/user/resume/{id}` — удалить резюме.
- `POST /api/user/{resumeId}/image` — загрузить изображение.
- `GET /api/user/resume-image/{resumeId}/content` — получить контент изображения.
- `GET /api/user/{resumeId}/images/content` — получить presigned URL изображений.
- `DELETE /api/user/resume-image/{resumeImageId}/content` — удалить изображение.

### Company/Vacancy Service (`/api/comp-vac`)

#### Компании
- `GET /api/comp-vac/company`
- `POST /api/comp-vac/company`
- `GET /api/comp-vac/company/{id}`
- `PUT /api/comp-vac/company/{id}`
- `PUT /api/comp-vac/company-accept/{id}`
- `DELETE /api/comp-vac/company/{id}`
- `GET /api/comp-vac/my-company`
- `PUT /api/comp-vac/my-company/{id}`
- `DELETE /api/comp-vac/my-company/{id}`

#### Вакансии
- `GET /api/comp-vac/vacancy`
- `GET /api/comp-vac/vacancy/{id}`
- `GET /api/comp-vac/my-vacancy`
- `GET /api/comp-vac/admin/vacancy`
- `POST /api/comp-vac/vacancy`
- `PUT /api/comp-vac/vacancy/{id}`
- `DELETE /api/comp-vac/vacancy/{id}`

#### Отклики
- `POST /api/comp-vac/vacancy/{id}/response`
- `GET /api/comp-vac/responses`
- `GET /api/comp-vac/responses/{id}`

## Kafka-топики

`notification-service` слушает следующие топики:

- `user-registration`
- `user-change-event`
- `user-forgot-event`
- `response-notifications`

## Быстрый запуск (Docker Compose)

Нужен только Docker: сборка JAR и фронтенда выполняется внутри образов.

```bash
cp .env.example .env      # заполнить секреты (пароли БД, JWT_SECRET, ADMIN_*, YC_*, MAIL_*)
docker compose up -d --build
```

- Приложение: `http://localhost` (nginx → frontend + API)
- Администратор создаётся при первом запуске из `ADMIN_LOGIN` / `ADMIN_PASSWORD`
- Health-check сервисов: `/actuator/health` (используется в `HEALTHCHECK` образов)

Масштабирование backend-сервисов: `AUTH_REPLICAS`, `COMPVAC_REPLICAS` в `.env`
или `docker compose up -d --scale auth-service=3`.

Логи всех сервисов — в stdout: `docker compose logs -f <service>`.

### С Graylog и pgAdmin

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

- Graylog: `http://localhost:9000`, pgAdmin: `http://localhost:5050`

## Схема БД и миграции

Схема управляется **Liquibase** (`<service>/demo/src/main/resources/db/changelog`).
Миграции применяются автоматически при старте сервиса, Hibernate работает в режиме `validate`.
Новая миграция — новый файл `NNN-описание.sql` в каталоге `changes/`.

## Локальный запуск без Docker

Поднять только инфраструктуру и задать переменные окружения (см. `.env.example`):

```bash
docker compose up -d auth-db company-vacancy-db redis kafka
cd auth-service/demo && DB_PASSWORD=... JWT_SECRET=... ./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend/my-app
npm install
NEXT_PUBLIC_API_URL=http://localhost npm run dev   # http://localhost:3000
```

## Конфигурация

Вся конфигурация передаётся через переменные окружения, полный список с описанием — в `.env.example`.
Основные переменные сервисов:

| Переменная | Сервис | Назначение |
|---|---|---|
| `PORT` | все backend | HTTP-порт |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | auth, company-vacancy | подключение к PostgreSQL |
| `KAFKA_BOOTSTRAP_SERVERS` | все backend | адрес Kafka |
| `REDIS_HOST`, `REDIS_PORT` | auth | адрес Redis |
| `JWT_SECRET` | auth, company-vacancy | ключ подписи JWT |
| `CORS_ALLOWED_ORIGINS` | auth, company-vacancy | разрешённые origin через запятую |
| `ADMIN_LOGIN`, `ADMIN_PASSWORD` | auth | первичный администратор |
| `YC_ACCESS_KEY`, `YC_SECRET_KEY`, `YC_BUCKET_NAME`, `YC_REGION` | auth | Yandex Object Storage |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | notification | SMTP |
| `FRONTEND_URL` | notification | адрес сайта для ссылок в письмах |
| `NEXT_PUBLIC_API_URL` | frontend | адрес API (пусто — тот же origin) |
| `SPRING_PROFILES_ACTIVE=graylog`, `GRAYLOG_HOST` | все backend | дополнительно слать логи в Graylog |

## Технологии

- Java 17, Spring Boot 3.4, Spring Security, Spring Data JPA, Liquibase
- PostgreSQL 16, Redis 7
- Apache Kafka 3.8 (KRaft)
- Nginx
- Next.js 15, React 19, TypeScript
- Docker, Docker Compose
- Опционально: Graylog + Elasticsearch + MongoDB

## Структура каталогов

```text
.
├── auth-service/
│   └── demo/                # Spring Boot auth + resume
├── company-vacancy-service/
│   └── demo/                # Spring Boot companies + vacancies + responses
├── notification-service/
│   └── demo/                # Kafka consumers + email notifications
├── frontend/
│   └── my-app/              # Next.js frontend
├── nginx/                   # конфигурация reverse proxy
├── docker-compose.yml                 # приложение + backing services
├── docker-compose.observability.yml   # Graylog, pgAdmin (опционально)
├── .env.example                       # шаблон конфигурации
└── Отчёт.md
```
