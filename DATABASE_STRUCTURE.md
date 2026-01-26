# Структура базы данных (подробно)

Ниже описана **актуальная** структура БД согласно моделям Sequelize в `server/models/`.
Схема ориентирована на Telegram‑аутентификацию: все пользовательские данные привязаны к `telegramUserId`.

Общие сведения:
- Все таблицы создаются Sequelize и содержат стандартные поля: `id` (PK, auto), `createdAt`, `updatedAt`.
- В пользовательских таблицах есть **два уровня привязки к пользователю**:
  - `telegramUserId` (строка) — историческая логическая связка.
  - `UserId` (INTEGER, FK на `User.id`) — физическая связь на уровне БД/ORM.
- Фактическая БД — MySQL 8 (в Docker Compose), но описанные типы соответствуют Sequelize и одинаковы по смыслу.

---

## 1) Users (`User`)
Хранит профиль Telegram‑пользователя.

Поля:
- `id` — PK, автоинкремент.
- `telegramUserId` — STRING, уникальное, допускает `NULL`.
- `username` — STRING, допускает `NULL`.
- `firstName` — STRING, допускает `NULL`.
- `lastName` — STRING, допускает `NULL`.
- `photoUrl` — TEXT, допускает `NULL`.
- `lastLoginAt` — DATE, допускает `NULL`.
- `createdAt`, `updatedAt` — стандартные поля Sequelize.

Индексы:
- `UNIQUE (telegramUserId)`

Связи:
- `User` **hasMany**: `Habit`, `BudgetItem`, `BudgetPlan`, `DailyNote`, `SleepEntry`, `Event`, `Task`.
- Дополнительно используется логическая связка через `telegramUserId` (для обратной совместимости).

---

## 2) Habits (`Habit`)
Справочник привычек пользователя.

Поля:
- `id` — PK.
- `UserId` — INTEGER, FK → `User.id`, допускает `NULL`.
- `telegramUserId` — STRING, допускает `NULL`.
- `name` — STRING, NOT NULL.
- `description` — STRING, допускает `NULL`.
- `category` — STRING, допускает `NULL`.
- `frequency` — STRING, NOT NULL, default `'daily'`, допустимые: `daily | weekly | monthly`.
- `schedule` — JSON, default `null`.  
  Примеры:
  - weekly: `["mon","wed","fri"]`
  - monthly: `[1,15,30]`
  - daily: `null`
- `createdAt`, `updatedAt`.

Связи:
- `Habit` **belongsTo** `User`.
- `Habit` **hasMany** `HabitCompletion` (onDelete: CASCADE).

---

## 3) Habit Completions (`HabitCompletion`)
Дневные отметки выполнения привычек.

Поля:
- `id` — PK.
- `HabitId` — FK к `Habit`.
- `date` — DATEONLY, NOT NULL.
- `completed` — BOOLEAN, default `false`.
- `createdAt`, `updatedAt`.

Индексы:
- `UNIQUE (HabitId, date)` — одна отметка в день на привычку.

Связи:
- `HabitCompletion` **belongsTo** `Habit`.

---

## 4) Budget Items (`BudgetItem`)
Доходы и расходы.

Поля:
- `id` — PK.
- `UserId` — INTEGER, FK → `User.id`, допускает `NULL`.
- `telegramUserId` — STRING, допускает `NULL`.
- `type` — ENUM(`income`, `expense`), NOT NULL.
- `amount` — FLOAT, NOT NULL.
- `category` — STRING, допускает `NULL`.
- `date` — DATEONLY, default `NOW`.
- `description` — STRING, допускает `NULL`.
- `createdAt`, `updatedAt`.

Связи:
- `BudgetItem` **belongsTo** `User`.

---

## 5) Budget Plans (`BudgetPlan`)
Плановые суммы по категориям на месяц.

Поля:
- `id` — PK.
- `UserId` — INTEGER, FK → `User.id`, допускает `NULL`.
- `telegramUserId` — STRING, допускает `NULL`.
- `year` — INTEGER, NOT NULL.
- `month` — INTEGER, NOT NULL, диапазон 1–12.
- `category` — STRING, NOT NULL.
- `type` — ENUM(`income`, `expense`), NOT NULL.
- `plannedAmount` — FLOAT, NOT NULL, `min: 0`.
- `createdAt`, `updatedAt`.

Индексы:
- `UNIQUE (telegramUserId, year, month, category, type)` — один план на категорию.

Связи:
- `BudgetPlan` **belongsTo** `User`.

---

## 6) Daily Notes (`DailyNote`)
Заметки по дням.

Поля:
- `id` — PK.
- `UserId` — INTEGER, FK → `User.id`, допускает `NULL`.
- `telegramUserId` — STRING, допускает `NULL`.
- `date` — DATEONLY, NOT NULL.
- `title` — STRING, допускает `NULL`.
- `content` — TEXT, допускает `NULL`.
- `createdAt`, `updatedAt`.

Индексы:
- `UNIQUE (telegramUserId, date)` — одна заметка на день.

Связи:
- `DailyNote` **belongsTo** `User`.

---

## 7) Sleep Entries (`SleepEntry`)
Учет сна.

Поля:
- `id` — PK.
- `UserId` — INTEGER, FK → `User.id`, допускает `NULL`.
- `telegramUserId` — STRING, допускает `NULL`.
- `date` — DATEONLY, NOT NULL.
- `hours` — FLOAT, NOT NULL, диапазон `0–24`.
- `createdAt`, `updatedAt`.

Индексы:
- `UNIQUE (telegramUserId, date)` — одна запись на день.

Связи:
- `SleepEntry` **belongsTo** `User`.

---

## 8) Events (`Event`)
События календаря.

Поля:
- `id` — PK.
- `UserId` — INTEGER, FK → `User.id`, допускает `NULL`.
- `telegramUserId` — STRING, допускает `NULL`.
- `title` — STRING, NOT NULL.
- `description` — TEXT, допускает `NULL`.
- `startDate` — DATEONLY, NOT NULL.
- `startTime` — TIME, допускает `NULL`.
- `endDate` — DATEONLY, допускает `NULL`.
- `endTime` — TIME, допускает `NULL`.
- `category` — STRING, NOT NULL, default `Personal`.
- `color` — STRING, NOT NULL, default `#6C5DD3`.
- `allDay` — BOOLEAN, default `true`.
- `createdAt`, `updatedAt`.

Связи:
- `Event` **belongsTo** `User`.

---

## 9) Tasks (`Task`)
Задачи (личные/рабочие).

Поля:
- `id` — PK.
- `UserId` — INTEGER, FK → `User.id`, допускает `NULL`.
- `telegramUserId` — STRING, допускает `NULL`.
- `type` — STRING, NOT NULL, `personal | work`.
- `title` — STRING, NOT NULL.
- `description` — TEXT, допускает `NULL`.
- `startDate` — DATEONLY, допускает `NULL`.
- `dueDate` — DATEONLY, допускает `NULL`.
- `priority` — STRING, NOT NULL, default `Medium`, `Low | Medium | High | Urgent`.
- `category` — STRING, NOT NULL, default `Personal`.
- `status` — STRING, NOT NULL, default `todo`, `todo | in_progress | done`.
- `createdAt`, `updatedAt`.

Индексы:
- `INDEX (type)`
- `INDEX (category)`
- `INDEX (status)`
- `INDEX (priority)`

Связи:
- `Task` **belongsTo** `User`.
- `Task` **hasMany** `Subtask` (onDelete: CASCADE)
- `Task` **hasMany** `TaskAttachment` (onDelete: CASCADE)
- `Task` **hasMany** `TaskNote` (onDelete: CASCADE)

---

## 10) Subtasks (`Subtask`)
Подзадачи задачи.

Поля:
- `id` — PK.
- `TaskId` — FK к `Task`.
- `title` — STRING, NOT NULL.
- `completed` — BOOLEAN, default `false`.
- `order` — INTEGER, default `0`.
- `createdAt`, `updatedAt`.

---

## 11) Task Attachments (`TaskAttachment`)
Вложения к задачам.

Поля:
- `id` — PK.
- `TaskId` — FK к `Task`.
- `fileName` — STRING, NOT NULL.
- `filePath` — STRING, NOT NULL.
- `fileSize` — INTEGER, допускает `NULL`.
- `mimeType` — STRING, допускает `NULL`.
- `createdAt`, `updatedAt`.

---

## 12) Task Notes (`TaskNote`)
Заметки внутри задач.

Поля:
- `id` — PK.
- `TaskId` — FK к `Task`.
- `content` — TEXT, NOT NULL.
- `createdAt`, `updatedAt`.

---

## 13) Ключевые принципы данных

- **Гибридная привязка пользователя**: `UserId` (FK) + `telegramUserId` (логическая связка).
- **Уникальные ограничения по дате** (DailyNote, SleepEntry, HabitCompletion) предотвращают дубли.
- **Удаление каскадом** применяется только в задачах и привычках.

