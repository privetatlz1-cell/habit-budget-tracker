# Habit & Budget Tracker — Полная документация проекта и DevOps

Документ фиксирует всю проделанную работу: суть проекта, технологии, архитектуру, структуру кода, а также **максимально подробный** раздел по развертыванию и DevOps‑части (Docker, Compose, Git/GitLab, Nginx, HTTPS, Telegram Mini App).

---

## 1) Суть проекта

Habit & Budget Tracker — это полнофункциональное веб‑приложение для:
- отслеживания привычек (ежедневно/еженедельно/ежемесячно),
- учета бюджета (доходы/расходы),
- мониторинга сна,
- ведения задач и событий,
- работы в формате **Telegram Mini App** (аутентификация через Telegram).

Интерфейс ориентирован на мобильный сценарий (Telegram), поддерживает темную тему и русскую/английскую локализацию.

---

## 2) Ключевые возможности

- **Привычки**
  - график по дням недели/месяца;
  - календарь с отметками выполнения;
  - прогресс за неделю/месяц;
  - серия (streak).
- **Бюджет**
  - ввод доходов и расходов;
  - категории;
  - сводка по месяцу;
  - визуализация графиками.
- **Сон**
  - ввод часов сна;
  - недельный график;
  - статистика по качеству сна.
- **Задачи/Календарь**
  - события, заметки, задачи.
- **Telegram Mini App**
  - вход по Telegram (без email/пароля);
  - проверка `initData` на бэкенде;
  - данные привязаны к Telegram user ID.

---

## 3) Технологии и языки

### Frontend
- **JavaScript** (React)
- **React** (SPA)
- **Tailwind CSS** (утилитарные стили)
- **Chart.js** (визуализация)
- **Telegram Web App SDK** (`@twa-dev/sdk`)
- **Context API** (auth, i18n, theme)

### Backend
- **JavaScript (Node.js)** + **Express**
- **Sequelize ORM**
- **MySQL 8** (текущая БД в Docker Compose)
- **PostgreSQL** (альтернатива в `docker-compose.prod.yml`)

### DevOps / Deployment
- **Docker** (многоступенчатая сборка)
- **Docker Compose** (оркестрация контейнеров)
- **Nginx** (reverse proxy)
- **Git / GitLab CI** (сборка и пуш образа)
- **Netlify** (опционально для фронтенда)

---

## 4) Архитектура приложения

```
Клиент (Telegram / Browser)
          |
         HTTPS
          |
     Nginx (reverse proxy)
          |
   app контейнер (Node + React build)
          |
   db контейнер (MySQL 8)
```

### Frontend
- SPA в `src/`.
- Контексты: `AuthContext`, `LanguageContext`, `ThemeContext`.
- API-вызовы через `${API_BASE}/api/...`.
- Сборка `npm run build` и раздача через backend.

### Backend
- Роуты в `server/routes/`.
- Модели в `server/models/`.
- Все данные фильтруются по `telegramUserId`.

### Telegram Auth
- `WebApp.initData` считывается на фронте.
- `/api/telegram/auth` проверяет подпись HMAC‑SHA256.
- На успешную проверку выдается JWT.

---

## 5) Структура проекта

```
/
├── src/                    # React frontend
├── server/                 # Express backend
├── Dockerfile              # multi-stage сборка
├── docker-compose.yml      # MySQL + app + nginx
├── docker-compose.prod.yml # Postgres вариант
├── nginx/nginx.conf        # reverse proxy
├── .gitlab-ci.yml          # CI build/push
├── netlify.toml            # Netlify frontend
└── public/_redirects       # SPA redirects
```

---

## 6) Важные конфигурационные файлы

### 6.1 `Dockerfile`
Многоступенчатая сборка:
1) **Builder stage**
   - устанавливает зависимости;
   - запускает `npm run build`.
2) **Runtime stage**
   - ставит только production deps;
   - копирует `build` и `server`;
   - запускает backend.

**Зачем:** уменьшение размера образа, быстрый деплой.

### 6.2 `docker-compose.yml`
Основной compose-файл (MySQL + app + nginx):

**Сервисы:**
1) `db` (MySQL 8)
   - образ: `mysql:8.0`;
   - переменные: `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`;
   - volume: `mysql_data` для постоянного хранения;
   - healthcheck: `mysqladmin ping`.

2) `app` (Node + React build)
   - собирается из `Dockerfile`;
   - берет `.env`;
   - `DATABASE_URL` собирается на базе MySQL‑переменных;
   - зависит от `db`.

3) `nginx`
   - образ: `nginx:alpine`;
   - проксирует трафик в `app:5000`;
   - порт наружу через `NGINX_PORT` (по умолчанию 8080).

### 6.3 `docker-compose.prod.yml`
Альтернативная схема с PostgreSQL:
- `db` = `postgres:15-alpine`;
- `backend` слушает порт `5000`;
- healthcheck для PostgreSQL и backend.

### 6.4 `nginx/nginx.conf`
Минимальный reverse proxy:
- слушает 80;
- проксирует все запросы на `app:5000`;
- выставляет заголовки `X-Real-IP`, `X-Forwarded-*`.

### 6.5 `.gitlab-ci.yml`
CI‑пайплайн сборки:
- Docker-in-Docker;
- логин в GitLab registry;
- build/push image `latest`.

### 6.6 `netlify.toml` и `public/_redirects`
Для статического SPA‑хостинга на Netlify:
- все пути редиректятся на `index.html`.

### 6.7 `Dockerfile.dev`, `Dockerfile.client`, `docker-compose.override.yml.example`
Дополнительные файлы для альтернативных сценариев:
- `Dockerfile.dev` — dev‑окружение для backend с hot‑reload (nodemon).
- `Dockerfile.client` — отдельный контейнер для статического фронтенда (serve).
- `docker-compose.override.yml.example` — пример override‑конфига для локальной разработки (в исходном виде ориентирован на Postgres и сервис `backend`).

**Зачем:** быстрый локальный dev‑цикл и возможность разделять фронт/бэк контейнерами при необходимости.

---

## 7) Переменные окружения

Минимальный набор `.env`:

**Database**
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PORT`

**App**
- `NODE_ENV`
- `PORT`
- `JWT_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `CORS_ORIGINS` (через запятую, если требуется строгий CORS)

**Compose**
- `NGINX_PORT`

---

## 8) Развертывание — ПОЛНЫЙ DevOps Runbook

Ниже максимально подробная инструкция по развертыванию на VM с Docker Compose, Nginx и HTTPS.

### 8.1 Архитектура продакшена

```
Пользователь (Telegram/Browser)
           |
          HTTPS
           |
        Nginx
           |
   app container (Node + React build)
           |
      db container (MySQL)
```

### 8.2 Подготовка VM

1) **Создание VM**
   - Linux VM с публичным IP.
   - Рекомендуется Ubuntu/Debian.

2) **Установка Docker**
   - Проверка: `docker --version`.

3) **Установка Docker Compose**
   - Проверка: `docker compose version`.

4) **Swap (если слабая VM)**
   - При сборке `npm run build` в Docker может не хватить RAM.
   - Создаем swap (например 2GB) — решает зависания.

5) **Firewall (опционально)**
   - Открыть 80/443 (HTTP/HTTPS).
   - Если используется `NGINX_PORT=8080`, открыть 8080.

### 8.3 DNS и домен

Telegram Mini App требует HTTPS.

1) Покупаем домен.
2) В DNS добавляем `A` запись на IP VM.
3) Проверяем через `dig @8.8.8.8`.

### 8.4 Git и обновление кода

На сервере:
1) `git pull` — забираем последние изменения.
2) `docker compose up -d --build` — пересобираем образ.

### 8.4.1 Подготовка `.env`

Перед первым запуском нужно создать `.env` в корне проекта и заполнить минимум:
- `JWT_SECRET` — ключ подписи JWT.
- `TELEGRAM_BOT_TOKEN` — токен бота BotFather.
- `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`.
- `PORT` (обычно 5000).
- `CORS_ORIGINS` (если нужен строгий CORS для доменов).

Это критично: без этих значений Telegram auth и база работать не будут.

### 8.5 Сборка Docker образа

Команда:
```
docker compose up -d --build
```

Что происходит:
1) Docker запускает multi-stage build.
2) React собирается в `/build`.
3) Backend запускает `server/index.js`.

### 8.5.1 Инициализация БД

В `server/index.js` используется:
```
db.sync({ alter: true })
```
Это означает, что при старте сервер автоматически синхронизирует модель и таблицы (ALTER при необходимости).

Также в проекте есть каталог `server/migrations/` — он хранит историю изменений структуры, но текущая runtime‑синхронизация делается через Sequelize `sync`.

### 8.6 Docker Compose сервисы

**db**:
- MySQL с volume `mysql_data`.

**app**:
- читает `.env`;
- подключается к MySQL через `DATABASE_URL`.

**nginx**:
- публичная точка входа;
- отправляет трафик в `app:5000`.

### 8.7 HTTPS (обязательно для Telegram)

**Вариант A: Nginx + Certbot на хосте**
1) Установить Nginx на VM.
2) Создать `server_name domain`.
3) Проксировать в Docker (`localhost:8080`).
4) Получить SSL:
   ```
   certbot --nginx -d yourdomain.com
   ```
5) Проверить авто‑renew.

**Вариант B: TLS внутри Docker**
1) Примонтировать сертификаты в контейнер.
2) Настроить `listen 443 ssl` внутри `nginx`.

### 8.8 Telegram Mini App

1) Создать бота через BotFather.
2) Получить `TELEGRAM_BOT_TOKEN`.
3) Указать URL мини-приложения (HTTPS).
4) В `.env` прописать токен.

Backend проверяет `initData` → обеспечивает безопасность.

### 8.9 GitLab CI

`.gitlab-ci.yml`:
- запускается на `main/master`;
- билдит Docker образ;
- пушит `latest` в registry.

### 8.10 Использование registry вместо build

Если нужно ускорить деплой:
```
app:
  image: registry.gitlab.com/...:latest
```

В этом случае compose не билдит локально, а тянет готовый образ.

### 8.11 Диагностика

Полезные команды:
- `docker compose ps`
- `docker compose logs app`
- `docker compose logs db`
- `docker compose logs nginx`

Частые проблемы:
- порт уже занят;
- домен не резолвится;
- нехватка RAM при build.

---

## 9) Итог по DevOps работе

1) Создан Dockerfile с multi-stage build.
2) Настроен Compose на 3 контейнера (app + MySQL + nginx).
3) Внедрен Nginx reverse proxy.
4) Написан GitLab CI pipeline.
5) Настроен HTTPS (обязательно для Telegram).
6) Обеспечен безопасный Telegram auth flow.

---

## 10) Итог по проекту

Проект готов к эксплуатации в Telegram Mini App: имеет надежный backend, защищенную аутентификацию, базу данных, CI/CD и документацию по развертыванию.

