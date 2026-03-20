---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - planning-artifacts/prd.md
  - planning-artifacts/architecture.md
  - planning-artifacts/ux-design-specification.md
---

# bmad-cem - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for bmad-cem, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

#### Библиотека вопросов
- FR1: Пользователь может создавать вопросы с указанием типа (NPS, открытый, закрытый, матричный, мульти-селект)
- FR2: Пользователь может просматривать список всех вопросов с фильтрацией по типу
- FR3: Пользователь может редактировать вопрос, если на него ещё нет ответов
- FR4: Пользователь может удалить вопрос, если на него ещё нет ответов
- FR5: Система блокирует редактирование и удаление вопросов, на которые уже есть ответы
- FR6: Пользователь может искать вопросы по тексту

#### Конструктор опросов
- FR7: Пользователь может создать новый опрос с названием
- FR8: Пользователь может добавлять вопросы из библиотеки на граф через кнопку
- FR9: Пользователь может соединять ноды рёбрами для определения порядка прохождения
- FR10: Пользователь может настраивать бранчинг через типизированные выходы нод (NPS: detractor/passive/promoter, закрытый: выход на каждый вариант)
- FR11: Пользователь может удалять ноды и рёбра с графа
- FR12: Пользователь может настраивать параметры ноды через боковую панель при клике
- FR13: Система визуализирует опрос как направленный граф на React Flow

#### Валидация флоу
- FR14: Система обнаруживает тупиковые ноды (ноды без исходящих рёбер, кроме финальных)
- FR15: Система обнаруживает циклы в графе
- FR16: Система подсвечивает проблемные ноды и рёбра на графе
- FR17: Система блокирует активацию опроса при наличии ошибок валидации

#### Жизненный цикл опроса
- FR18: Пользователь может активировать опрос из статуса Draft
- FR19: Пользователь может завершить активный опрос (перевод в Completed)
- FR20: Пользователь может архивировать завершённый опрос
- FR21: Система запрещает переактивацию завершённого опроса
- FR22: Система запрещает удаление опросов (только архивация)
- FR23: Пользователь может просматривать список опросов с пагинацией и поиском по названию

#### Распространение
- FR24: Пользователь может добавлять респондентов по email через веб-интерфейс
- FR25: Система генерирует персональную уникальную ссылку для каждого респондента
- FR26: Система дедуплицирует респондентов по email в рамках опроса
- FR27: Пользователь может просматривать список респондентов с пагинацией и поиском по email
- FR28: Система отслеживает статус каждого респондента (не открыл / открыл / в процессе / завершил)
- FR29: Система отслеживает drop-off респондентов

#### UX респондента
- FR30: Респондент видит welcome-экран при открытии ссылки
- FR31: Респондент проходит опрос в пошаговом формате (один вопрос за раз)
- FR32: Респондент видит прогресс-бар прохождения
- FR33: Система поддерживает навигацию только вперёд (без возврата)
- FR34: Система сохраняет прогресс респондента в localStorage
- FR35: Респондент видит финальный экран «Спасибо» после завершения
- FR36: Интерфейс респондента адаптируется под мобильные устройства
- FR37: Каждый ответ респондента отправляется на backend отдельно

#### Аналитика
- FR38: Пользователь может просматривать общий дашборд (количество ответов, completion rate, средний NPS)
- FR39: Пользователь может просматривать распределение ответов по каждому вопросу (гистограмма, pie chart)
- FR40: Пользователь может просматривать satisfaction matrix
- FR41: Пользователь может просматривать heatmap путей прохождения на графе React Flow
- FR42: Пользователь может фильтровать аналитику по дате, респонденту, ветке флоу
- FR43: Пользователь может просматривать полный путь и ответы конкретного респондента

#### Аутентификация и UI
- FR44: Система создаёт дефолтного пользователя при первом запуске (admin/123)
- FR45: Пользователь может войти по логину и паролю с получением JWT-токена
- FR46: Система отображает пустой дашборд с кнопкой «Создать опрос» при отсутствии опросов
- FR47: Все списки поддерживают пагинацию
- FR48: Интерфейс использует светлую тему

### NonFunctional Requirements

#### Performance
- NFR1: Страницы приложения загружаются за < 2 секунды
- NFR2: Граф-конструктор плавно работает с опросами до 50 нод
- NFR3: Heatmap и аналитика рассчитываются за < 3 секунды для опросов с до 500 ответами
- NFR4: Интерфейс респондента загружает следующий вопрос за < 1 секунду
- NFR5: Валидация флоу выполняется за < 1 секунду

#### Security
- NFR6: JWT-токены имеют ограниченное время жизни
- NFR7: API-эндпоинты аутентификации защищены от brute-force (rate limiting на логин)
- NFR8: Ссылки респондентов используют UUID v4 (непредсказуемые)
- NFR9: API респондента не требует аутентификации, но доступен только по персональной ссылке
- NFR10: Данные передаются по HTTPS

### Additional Requirements

#### Из Architecture
- AR1: Monorepo setup: create-turbo + create-next-app + nest new + pnpm workspaces
- AR2: Docker Compose с PostgreSQL (единственный сервис)
- AR3: packages/shared: ТОЛЬКО интерфейсы, enums, types, pure functions — никаких классов и зависимостей от фреймворков
- AR4: Strict layering: Controller → Service → Repository + отдельный Mapper для entity ↔ DTO
- AR5: API versioning: /api/v1/...
- AR6: Глобальный ValidationPipe (whitelist: true, forbidNonWhitelisted: true)
- AR7: Response wrapper interceptor ({ data, meta }) для всех API-ответов
- AR8: Global exception filter с errorCode из shared enum
- AR9: JWT auth: глобальный JwtAuthGuard + @Public() декоратор для публичных эндпоинтов
- AR10: Swagger/OpenAPI документация (@nestjs/swagger, авто-генерация из DTO)
- AR11: Seed script для дефолтного пользователя (admin/123) при первом запуске
- AR12: CORS: NestJS enableCors() с whitelist origin
- AR13: Flow validation algorithm в packages/shared (pure functions) — используется и frontend, и backend
- AR14: TypeORM synchronize: true (без миграций на MVP)
- AR15: Zustand для state management граф-конструктора, React Query для server state
- AR16: React Hook Form для форм, Recharts для аналитики
- AR17: Stateless приложение, JWT access token 24h без refresh tokens

### UX Design Requirements

- UX-DR1: SurveyNode — кастомная нода вопроса для React Flow. 5 вариантов по типу вопроса с цветовым кодированием (NPS/blue, открытый/emerald, закрытый/violet, матричный/amber, мульти-селект/pink). States: default, selected (синяя обводка), error (coral подсветка), heatmap (с счётчиком). Header: цветная точка + текст (truncate 30 символов). Body: список выходных узлов. Размер ~160-200px ширина.
- UX-DR2: WelcomeNode — стартовая нода графа. Компактная нода slate-цвета с одним выходом "Начать". States: default, selected.
- UX-DR3: ThankYouNode — финальная нода графа. Компактная нода slate-цвета без выходов. States: default, selected.
- UX-DR4: HeatmapEdge — кастомное ребро для визуализации трафика между нодами. Variants: thin (1-2px), medium (3-4px), thick (5-6px). Drop-off: пунктирная rose линия. Цветовой градиент slate-200 → blue-300 → blue-600.
- UX-DR5: SurveyCard — карточка опроса на дашборде. Содержит: название + дата + кол-во вопросов + Badge статуса + мини-статистика (респонденты, завершили, NPS). States: default, hover (shadow увеличивается).
- UX-DR6: RespondentCard — карточка вопроса для респондента. 5 вариантов по типу (NPS: кнопки 0-10, открытый: textarea, закрытый: RadioGroup, матричный: таблица RadioGroup, мульти-селект: Checkbox). Max-width 480px, mobile-first. States: empty (кнопка disabled), answered, submitting.
- UX-DR7: NpsGauge — виджет NPS Score на аналитике. Крупное число NPS (-100..+100) + stacked bar (detractor/passive/promoter сегменты) + проценты.
- UX-DR8: ValidationAlert — inline-алерт валидации флоу в тулбаре конструктора. States: success (зелёный), error (coral, список ошибок). Клик на ошибку → канвас центрирует на проблемной ноде.
- UX-DR9: Цветовая система — slate палитра: slate-50 фон, white surface с shadow-sm, slate-600 primary, slate-200 border. Семантические: emerald-500 success, amber-500 warning, rose-400 error, sky-500 info. 5 пастельных цветов типов вопросов. 4 цвета статусов опроса. Heatmap градиент slate-200 → blue-600 с drop-off rose-300.
- UX-DR10: Типографика — Inter шрифт. Шкала: h1 24px/semibold, h2 20px/semibold, h3 16px/semibold, body 14px/normal, small 12px/normal, node-title 13px/medium, node-label 11px/normal. Цвета текста: slate-800 primary, slate-500 secondary, slate-400 muted.
- UX-DR11: Layout админки — sidebar 240px фиксированная слева (4 пункта: Дашборд, Опросы, Вопросы, Аналитика), контент flex-1 padding 24px. Конструктор: канвас full-width + тулбар 48px сверху + боковая панель настроек 360px справа (Sheet, по клику на ноду).
- UX-DR12: Layout респондента — центрированная карточка max-width 480px, padding 24px (desktop) / 16px (mobile), full-width на <640px, NPS кнопки 40-48px, кнопка "Далее" full-width height 48px, прогресс-бар сверху.
- UX-DR13: Паттерны обратной связи — toast успеха (зелёный, auto-hide 3s), inline errors под полями форм (rose-400 border), валидация графа (coral подсветка нод + кликабельный список в тулбаре), skeleton loading для таблиц и карточек, empty states с иконкой + заголовок + описание + CTA-кнопка.
- UX-DR14: Button hierarchy — Primary (slate-600, white text, одна на экран), Outline (border, slate text), Ghost/SM (compact, тулбар/таблицы). Деструктивные: красный текст на outline + confirm dialog. Disabled: opacity-50.
- UX-DR15: Form patterns — все поля в одном view, валидация onBlur + submit, Sheet для настроек ноды (live update без кнопки "Сохранить"), ввод респондентов: email + "Добавить" (batch через запятую).
- UX-DR16: Navigation — sidebar (активный пункт: bg-slate-100), breadcrumb max 3 уровня, tabs аналитики (Метрики/Heatmap/Респонденты). Клик на Draft-опрос → конструктор, на Active/Completed → аналитика.
- UX-DR17: Pagination — 10 элементов на страницу, "Показано X из Y" слева + кнопки ← 1 2 3 → справа, активная страница bg-slate-600 text-white.
- UX-DR18: Search & Filter — поиск с debounce 300ms без кнопки, pill-кнопки фильтров по типу вопроса (одна активна), dropdown фильтры аналитики (дата, респондент, ветка), активные фильтры как badges.
- UX-DR19: Accessibility — WCAG 2.1 AA базовый, visible focus ring (ring-2 ring-slate-400 ring-offset-2), semantic HTML (nav, main, section, button, table), aria-label на иконочных кнопках, touch targets 44x44px минимум, цветовое кодирование дублируется иконками.
- UX-DR20: Responsive — админка desktop-only (min 1024px, горизонтальный скролл при <1024px), респондент mobile-first (breakpoints: <640px full-width, 640-1023px max-width 480px, ≥1024px max-width 480px).

### FR Coverage Map

| FR | Epic | Описание |
|---|---|---|
| FR1 | Epic 2 | Создание вопросов с указанием типа |
| FR2 | Epic 2 | Просмотр списка вопросов с фильтрацией по типу |
| FR3 | Epic 2 | Редактирование вопроса (если нет ответов) |
| FR4 | Epic 2 | Удаление вопроса (если нет ответов) |
| FR5 | Epic 2 | Блокировка редактирования/удаления вопросов с ответами |
| FR6 | Epic 2 | Поиск вопросов по тексту |
| FR7 | Epic 3 | Создание нового опроса с названием |
| FR8 | Epic 3 | Добавление вопросов из библиотеки на граф |
| FR9 | Epic 3 | Соединение нод рёбрами |
| FR10 | Epic 3 | Настройка бранчинга через типизированные выходы |
| FR11 | Epic 3 | Удаление нод и рёбер |
| FR12 | Epic 3 | Настройка параметров ноды через боковую панель |
| FR13 | Epic 3 | Визуализация опроса как направленного графа |
| FR14 | Epic 3 | Обнаружение тупиковых нод |
| FR15 | Epic 3 | Обнаружение циклов в графе |
| FR16 | Epic 3 | Подсветка проблемных нод и рёбер |
| FR17 | Epic 3 | Блокировка активации при ошибках валидации |
| FR18 | Epic 4 | Активация опроса из Draft |
| FR19 | Epic 4 | Завершение активного опроса (Completed) |
| FR20 | Epic 4 | Архивация завершённого опроса |
| FR21 | Epic 4 | Запрет переактивации завершённого опроса |
| FR22 | Epic 4 | Запрет удаления опросов (только архивация) |
| FR23 | Epic 4 | Список опросов с пагинацией и поиском |
| FR24 | Epic 4 | Добавление респондентов по email |
| FR25 | Epic 4 | Генерация персональных уникальных ссылок |
| FR26 | Epic 4 | Дедупликация респондентов по email |
| FR27 | Epic 4 | Список респондентов с пагинацией и поиском |
| FR28 | Epic 4 | Трекинг статуса респондента |
| FR29 | Epic 4 | Трекинг drop-off респондентов |
| FR30 | Epic 5 | Welcome-экран при открытии ссылки |
| FR31 | Epic 5 | Пошаговый формат (один вопрос за раз) |
| FR32 | Epic 5 | Прогресс-бар прохождения |
| FR33 | Epic 5 | Навигация только вперёд |
| FR34 | Epic 5 | Сохранение прогресса в localStorage |
| FR35 | Epic 5 | Финальный экран «Спасибо» |
| FR36 | Epic 5 | Адаптация под мобильные устройства |
| FR37 | Epic 5 | Каждый ответ отправляется на backend отдельно |
| FR38 | Epic 6 | Общий дашборд (ответы, completion rate, NPS) |
| FR39 | Epic 6 | Распределение ответов (гистограмма, pie chart) |
| FR40 | Epic 6 | Satisfaction matrix |
| FR41 | Epic 6 | Heatmap путей на графе React Flow |
| FR42 | Epic 6 | Фильтрация аналитики |
| FR43 | Epic 6 | Полный путь и ответы конкретного респондента |
| FR44 | Epic 1 | Дефолтный пользователь при первом запуске |
| FR45 | Epic 1 | Логин с JWT-токеном |
| FR46 | Epic 1 | Пустой дашборд с кнопкой «Создать опрос» |
| FR47 | Epic 1 | Пагинация во всех списках |
| FR48 | Epic 1 | Светлая тема |

## Epic List

### Epic 1: Фундамент проекта и аутентификация
Пользователь может войти в систему и увидеть оболочку приложения — sidebar навигации, пустой дашборд с кнопкой «Создать опрос», светлая тема, базовые UI-паттерны.
**FRs:** FR44, FR45, FR46, FR47, FR48
**AR:** AR1-AR12, AR14, AR15, AR16, AR17
**UX-DR:** UX-DR9, UX-DR10, UX-DR11, UX-DR13, UX-DR14, UX-DR16, UX-DR17, UX-DR19

### Epic 2: Библиотека вопросов
Пользователь может создавать, просматривать, редактировать, удалять и искать вопросы 5 типов (NPS, открытый, закрытый, матричный, мульти-селект). Система защищает вопросы с существующими ответами от изменений.
**FRs:** FR1, FR2, FR3, FR4, FR5, FR6
**UX-DR:** UX-DR15, UX-DR18

### Epic 3: Граф-конструктор опросов
Пользователь может создать опрос и собрать его из вопросов библиотеки в визуальном граф-конструкторе — добавление нод, соединение рёбрами, настройка бранчинга через типизированные выходы, валидация флоу (обнаружение тупиков и циклов с подсветкой ошибок).
**FRs:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17
**AR:** AR13
**UX-DR:** UX-DR1, UX-DR2, UX-DR3, UX-DR8

### Epic 4: Жизненный цикл опроса и распространение
Пользователь может управлять жизненным циклом опроса (Draft→Active→Completed→Archived), добавлять респондентов по email, получать персональные ссылки, отслеживать статусы прохождения и drop-off.
**FRs:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29
**UX-DR:** UX-DR5

### Epic 5: Прохождение опроса респондентом
Респонденты могут пройти опрос по персональной ссылке — welcome-экран, пошаговый формат (один вопрос за раз), прогресс-бар, бранчинг, mobile-friendly интерфейс, экран «Спасибо».
**FRs:** FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR37
**UX-DR:** UX-DR6, UX-DR12, UX-DR20

### Epic 6: Аналитика и инсайты
Пользователь может анализировать результаты опросов — NPS score и breakdown, распределение ответов по вопросам, heatmap путей на графе, satisfaction matrix, фильтры по дате/респонденту/ветке, просмотр полного пути конкретного респондента.
**FRs:** FR38, FR39, FR40, FR41, FR42, FR43
**UX-DR:** UX-DR4, UX-DR7

## Epic 1: Фундамент проекта и аутентификация

Пользователь может войти в систему и увидеть оболочку приложения — sidebar навигации, пустой дашборд с кнопкой «Создать опрос», светлая тема, базовые UI-паттерны.

### Story 1.1: Инициализация monorepo и инфраструктуры

As a разработчик,
I want настроенный monorepo с работающими frontend, backend и базой данных,
So that я могу начать разработку фич на правильном фундаменте.

**Acceptance Criteria:**

**Given** пустая директория проекта
**When** выполнены команды инициализации (create-turbo, create-next-app, nest new)
**Then** создана структура monorepo: apps/web (Next.js 16), apps/api (NestJS 11), packages/shared, packages/config
**And** pnpm-workspace.yaml корректно определяет все workspace-пакеты
**And** turbo.json настроен с pipeline для dev, build, lint

**Given** настроенный monorepo
**When** запускается `docker compose up -d`
**Then** PostgreSQL доступен на localhost:5432

**Given** PostgreSQL запущен
**When** запускается `turbo dev`
**Then** apps/web доступен на localhost:3000
**And** apps/api доступен на localhost:3001
**And** оба приложения работают с hot reload

**Given** monorepo структура
**When** проверяется packages/shared
**Then** пакет экспортируется как @bmad-cem/shared
**And** импортируется обоими apps без ошибок

**Given** monorepo структура
**When** проверяются конфигурации TypeScript
**Then** strict mode включён во всех пакетах
**And** packages/config содержит базовые tsconfig (base, nextjs, nestjs)

### Story 1.2: Shared пакет — контракты API

As a разработчик,
I want единый пакет с интерфейсами, enum-ами и типами,
So that frontend и backend используют одинаковые контракты без рассинхронизации.

**Acceptance Criteria:**

**Given** packages/shared инициализирован
**When** создаются enum-файлы
**Then** существуют enums: ErrorCode, SurveyStatus (draft/active/completed/archived), QuestionType (nps/open/closed/matrix/multi_select), RespondentStatus (not_opened/opened/in_progress/completed)
**And** все enum-значения соответствуют PRD

**Given** packages/shared
**When** создаются интерфейсы DTO
**Then** существуют интерфейсы: ICreateSurveyDto, IUpdateSurveyDto, ISurveyResponseDto, ICreateQuestionDto, IUpdateQuestionDto, IQuestionResponseDto, IAddRespondentDto, ISubmitAnswerDto, IRespondentResponseDto, IAnalyticsResponseDto, IHeatmapResponseDto
**And** IPaginationMeta (page, limit, total, totalPages), IPaginatedResponse<T>

**Given** packages/shared
**When** создаются типы
**Then** существуют типы: IApiResponse<T> ({data, meta}), IApiError ({statusCode, message, errorCode}), ISurveyFlow, IFlowNode, IFlowEdge

**Given** packages/shared
**When** создаётся flow-validator.ts
**Then** содержит pure functions для обнаружения тупиков и циклов в графе
**And** функции не имеют side effects и зависимостей от фреймворков
**And** экспортируются через barrel index.ts

**Given** packages/shared полностью создан
**When** импортируется в apps/web и apps/api
**Then** все типы, интерфейсы и enum-ы доступны без ошибок компиляции

### Story 1.3: Backend bootstrap — глобальные паттерны NestJS

As a разработчик,
I want настроенный NestJS с глобальными паттернами (валидация, ошибки, формат ответов, Swagger),
So that все будущие модули автоматически следуют единым правилам.

**Acceptance Criteria:**

**Given** apps/api инициализирован
**When** настраивается ConfigModule
**Then** переменные окружения загружаются из .env (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, JWT_EXPIRES_IN)
**And** .env.example содержит шаблон всех переменных

**Given** ConfigModule настроен
**When** настраивается TypeORM
**Then** подключение к PostgreSQL работает через database.config.ts
**And** synchronize: true для MVP
**And** naming strategy трансформирует camelCase → snake_case

**Given** apps/api
**When** настраивается глобальный ValidationPipe
**Then** whitelist: true, forbidNonWhitelisted: true
**And** невалидные запросы возвращают 400 с описанием ошибок

**Given** apps/api
**When** настраивается глобальный ExceptionFilter
**Then** все ошибки возвращаются в формате {statusCode, message, errorCode}
**And** errorCode берётся из ErrorCode enum в shared
**And** неожиданные ошибки логируются и возвращают generic 500

**Given** apps/api
**When** настраивается ResponseWrapper interceptor
**Then** все успешные ответы оборачиваются в {data, meta}
**And** списки с пагинацией содержат meta: {page, limit, total, totalPages}

**Given** apps/api
**When** настраивается Swagger
**Then** документация доступна на /api/docs
**And** DTO автоматически документируются через декораторы

**Given** apps/api
**When** настраивается CORS
**Then** запросы с localhost:3000 принимаются
**And** запросы с других origin отклоняются

**Given** apps/api
**When** создаётся тестовый эндпоинт GET /api/v1/health
**Then** возвращает {data: {status: "ok"}, meta: {}}
**And** подтверждает работу всех глобальных паттернов

### Story 1.4: Аутентификация — логин и JWT

As a пользователь,
I want войти в систему по логину и паролю и получить JWT-токен,
So that я могу безопасно работать с приложением.

**Acceptance Criteria:**

**Given** приложение запущено впервые
**When** TypeORM синхронизирует схему
**Then** создаётся дефолтный пользователь (login: admin, password: 123 захеширован bcrypt)
**And** seed выполняется только если пользователей нет в БД (FR44)

**Given** дефолтный пользователь создан
**When** POST /api/v1/auth/login с {login: "admin", password: "123"}
**Then** возвращается JWT access token со сроком жизни 24 часа
**And** ответ в формате {data: {accessToken: "..."}, meta: {}} (FR45)

**Given** невалидные credentials
**When** POST /api/v1/auth/login с неправильным паролем
**Then** возвращается 401 с errorCode AUTH_INVALID_CREDENTIALS

**Given** JWT token получен
**When** запрос к защищённому эндпоинту с Authorization: Bearer <token>
**Then** запрос проходит через JwtAuthGuard и обрабатывается

**Given** отсутствие или невалидный JWT token
**When** запрос к защищённому эндпоинту
**Then** возвращается 401 Unauthorized

**Given** эндпоинт с декоратором @Public()
**When** запрос без JWT token
**Then** запрос обрабатывается без аутентификации (NFR9)

**Given** apps/web
**When** пользователь открывает страницу /login
**Then** отображается форма с полями логин и пароль и кнопкой "Войти"
**And** при успешном логине токен сохраняется и происходит редирект на /dashboard
**And** при ошибке отображается inline-сообщение об ошибке

**Given** пользователь не аутентифицирован
**When** пытается открыть любую страницу (admin)/*
**Then** происходит редирект на /login

### Story 1.5: App shell — sidebar, layout, дашборд и базовые UI-паттерны

As a пользователь,
I want видеть удобную оболочку приложения с навигацией и пустым дашбордом после входа,
So that я могу ориентироваться в системе и начать работу.

**Acceptance Criteria:**

**Given** пользователь аутентифицирован
**When** открывает /dashboard
**Then** отображается sidebar слева (240px) с 4 пунктами: Дашборд, Опросы, Вопросы, Аналитика (UX-DR11)
**And** активный пункт выделен (bg-slate-100 text-slate-800 font-medium) (UX-DR16)
**And** основной контент занимает flex-1 с padding 24px

**Given** нет созданных опросов
**When** пользователь на /dashboard
**Then** отображается EmptyState: иконка + "У вас ещё нет опросов" + кнопка "Создать опрос" (FR46, UX-DR13)

**Given** приложение загружено
**When** проверяется визуальный стиль
**Then** фон страниц slate-50, поверхности white с shadow-sm (UX-DR9)
**And** шрифт Inter, заголовки semibold, body 14px (UX-DR10)
**And** кнопки Primary (slate-600, white text), Outline (border), Ghost/SM (compact) (UX-DR14)
**And** интерфейс использует светлую тему (FR48)

**Given** компонент пагинации создан
**When** используется на странице со списком
**Then** отображает "Показано X из Y" слева + кнопки навигации справа
**And** 10 элементов на страницу, активная страница bg-slate-600 text-white (FR47, UX-DR17)

**Given** приложение загружено
**When** проверяются паттерны обратной связи
**Then** toast-уведомления работают (зелёный success, auto-hide 3s) (UX-DR13)
**And** skeleton loading отображается при загрузке данных (UX-DR13)

**Given** пользователь находится на вложенной странице
**When** проверяется breadcrumb
**Then** отображается навигационная цепочка (max 3 уровня) (UX-DR16)

**Given** приложение загружено
**When** проверяется accessibility
**Then** semantic HTML используется (nav, main, section, button) (UX-DR19)
**And** visible focus ring на интерактивных элементах (ring-2 ring-slate-400 ring-offset-2)
**And** aria-label на иконочных кнопках

## Epic 2: Библиотека вопросов

Пользователь может создавать, просматривать, редактировать, удалять и искать вопросы 5 типов. Система защищает вопросы с существующими ответами от изменений.

### Story 2.1: Backend — CRUD вопросов и защита целостности

As a пользователь,
I want API для управления вопросами с защитой от изменения вопросов с ответами,
So that я могу создавать и поддерживать библиотеку вопросов без риска потери данных.

**Acceptance Criteria:**

**Given** QuestionModule создан (entity, repository, mapper, service, controller)
**When** POST /api/v1/questions с {text: "Оцените от 0 до 10", type: "nps"}
**Then** вопрос создаётся в БД и возвращается в формате {data: IQuestionResponseDto, meta: {}}
**And** поддерживаются 5 типов: nps, open, closed, matrix, multi_select (FR1)

**Given** вопрос типа closed создаётся
**When** POST /api/v1/questions с {text: "...", type: "closed", options: ["Да", "Нет", "Не знаю"]}
**Then** варианты ответов сохраняются вместе с вопросом
**And** для типов matrix и multi_select варианты также обязательны

**Given** существуют вопросы в БД
**When** GET /api/v1/questions?page=1&limit=10
**Then** возвращается список с пагинацией {data: [...], meta: {page, limit, total, totalPages}} (FR2)

**Given** существуют вопросы разных типов
**When** GET /api/v1/questions?questionType=nps
**Then** возвращаются только вопросы указанного типа (FR2)

**Given** существуют вопросы
**When** GET /api/v1/questions?search=удовлетворённость
**Then** возвращаются вопросы, содержащие искомый текст (FR6)

**Given** вопрос без ответов
**When** PUT /api/v1/questions/:id с обновлёнными данными
**Then** вопрос обновляется (FR3)

**Given** вопрос без ответов
**When** DELETE /api/v1/questions/:id
**Then** вопрос удаляется (FR4)

**Given** вопрос с существующими ответами
**When** PUT /api/v1/questions/:id или DELETE /api/v1/questions/:id
**Then** возвращается 409 с errorCode QUESTION_HAS_RESPONSES (FR5)

**Given** несуществующий вопрос
**When** GET/PUT/DELETE /api/v1/questions/:id
**Then** возвращается 404 с errorCode QUESTION_NOT_FOUND

### Story 2.2: Frontend — страница библиотеки вопросов

As a пользователь,
I want видеть все свои вопросы в удобной таблице с фильтрацией и поиском,
So that я могу быстро найти нужный вопрос.

**Acceptance Criteria:**

**Given** пользователь аутентифицирован
**When** открывает /questions
**Then** отображается таблица вопросов с колонками: текст, тип (badge с цветом), дата создания
**And** таблица загружается через React Query с skeleton loading

**Given** страница вопросов загружена
**When** пользователь нажимает pill-кнопку типа (Все / NPS / Открытый / Закрытый / Матричный / Мульти-селект)
**Then** таблица фильтруется по выбранному типу, одна кнопка активна (UX-DR18)

**Given** страница вопросов загружена
**When** пользователь вводит текст в поле поиска
**Then** таблица фильтруется с debounce 300ms без кнопки поиска (UX-DR18, FR6)

**Given** вопросов больше 10
**When** страница отображается
**Then** пагинация внизу: "Показано X из Y" + кнопки навигации (UX-DR17)

**Given** нет созданных вопросов
**When** пользователь на /questions
**Then** отображается EmptyState: "Начните с создания вопросов" + кнопка "Новый вопрос" (UX-DR13)

**Given** тип вопроса отображается как badge
**When** проверяется визуальный стиль
**Then** NPS — blue, открытый — emerald, закрытый — violet, матричный — amber, мульти-селект — pink (UX-DR9)

### Story 2.3: Frontend — создание, редактирование и удаление вопросов

As a пользователь,
I want создавать, редактировать и удалять вопросы через удобные формы,
So that я могу наполнять библиотеку вопросами для своих опросов.

**Acceptance Criteria:**

**Given** пользователь на странице /questions
**When** нажимает кнопку "Новый вопрос"
**Then** открывается Dialog с формой: выбор типа (Select), текст вопроса (Textarea)
**And** при выборе типа closed/matrix/multi_select появляются поля для вариантов ответов
**And** все поля в одном view без wizard (UX-DR15)

**Given** форма создания открыта
**When** пользователь заполняет поля и нажимает "Сохранить"
**Then** вопрос создаётся через API, таблица обновляется (React Query invalidation)
**And** toast "Вопрос создан" появляется на 3 секунды (FR1)

**Given** форма создания открыта
**When** пользователь оставляет обязательное поле пустым и уходит с него (blur)
**Then** отображается inline-ошибка под полем (rose-400 border) (UX-DR15)

**Given** вопрос без ответов в таблице
**When** пользователь нажимает кнопку редактирования
**Then** открывается Dialog с заполненной формой, данные можно изменить (FR3)

**Given** вопрос с ответами в таблице
**When** пользователь видит этот вопрос
**Then** кнопки редактирования и удаления недоступны (disabled или скрыты)
**And** отображается индикатор "Есть ответы" (FR5)

**Given** вопрос без ответов
**When** пользователь нажимает кнопку удаления
**Then** открывается confirm Dialog с описанием последствий
**And** при подтверждении вопрос удаляется, таблица обновляется, toast "Вопрос удалён" (FR4, UX-DR14)

**Given** API возвращает ошибку (например, 409 QUESTION_HAS_RESPONSES)
**When** пользователь пытается редактировать/удалить
**Then** отображается inline alert с понятным сообщением об ошибке

## Epic 3: Граф-конструктор опросов

Пользователь может создать опрос и собрать его из вопросов библиотеки в визуальном граф-конструкторе — добавление нод, соединение рёбрами, настройка бранчинга через типизированные выходы, валидация флоу.

### Story 3.1: Backend — CRUD опросов и хранение flow (JSONB)

As a пользователь,
I want API для создания опросов и хранения графа,
So that мои опросы и их структура сохраняются на сервере.

**Acceptance Criteria:**

**Given** SurveyModule создан (entity, repository, mapper, service, controller)
**When** POST /api/v1/surveys с {title: "NPS Q1 2026"}
**Then** опрос создаётся со статусом draft и пустым flow (JSONB)
**And** возвращается {data: ISurveyResponseDto, meta: {}} (FR7)

**Given** опрос существует
**When** PUT /api/v1/surveys/:id/flow с {nodes: [...], edges: [...]}
**Then** flow сохраняется как JSONB в колонку flow таблицы surveys
**And** данные соответствуют типам ISurveyFlow, IFlowNode, IFlowEdge из shared

**Given** опрос существует
**When** GET /api/v1/surveys/:id
**Then** возвращается опрос с полным flow (nodes + edges)

**Given** существуют опросы
**When** GET /api/v1/surveys?page=1&limit=10
**Then** возвращается список опросов с пагинацией (без flow, только метаданные)

**Given** опрос существует
**When** PUT /api/v1/surveys/:id с {title: "Новое название"}
**Then** метаданные опроса обновляются

**Given** несуществующий опрос
**When** GET/PUT /api/v1/surveys/:id
**Then** возвращается 404 с errorCode SURVEY_NOT_FOUND

### Story 3.2: Frontend — канвас React Flow и базовые ноды

As a пользователь,
I want видеть визуальный граф-конструктор с кастомными нодами,
So that я могу визуально конструировать структуру опроса.

**Acceptance Criteria:**

**Given** пользователь создал опрос
**When** открывает /surveys/[id]/builder
**Then** отображается React Flow канвас на всю ширину контентной области
**And** тулбар 48px сверху с названием опроса и кнопками действий (FR13)

**Given** новый опрос (пустой flow)
**When** открывается конструктор
**Then** на канвасе автоматически создана WelcomeNode (slate-цвет, один выход "Начать") (UX-DR2)
**And** ThankYouNode доступна для добавления (slate-цвет, без выходов) (UX-DR3)

**Given** канвас с нодами
**When** отображается SurveyNode для вопроса
**Then** нода показывает: цветную точку типа + текст (truncate 30 символов) + выходные узлы (UX-DR1)
**And** цвет соответствует типу: NPS/blue, открытый/emerald, закрытый/violet, матричный/amber, мульти-селект/pink
**And** ширина ноды ~160-200px

**Given** SurveyNode на канвасе
**When** нода выделена
**Then** отображается синяя обводка (selected state) (UX-DR1)

**Given** канвас с нодами
**When** проверяется мини-карта
**Then** мини-карта React Flow отображается для навигации по большим графам

**Given** канвас с нодами
**When** проверяется производительность
**Then** канвас плавно работает с графом до 50 нод (NFR2)

### Story 3.3: Frontend — добавление вопросов и настройка бранчинга

As a пользователь,
I want добавлять вопросы из библиотеки на граф и настраивать бранчинг,
So that я могу собрать опрос с динамической логикой прохождения.

**Acceptance Criteria:**

**Given** конструктор открыт
**When** пользователь нажимает "Добавить вопрос" в тулбаре
**Then** открывается список вопросов из библиотеки для выбора
**And** выбранный вопрос появляется как нода на канвасе (FR8)

**Given** NPS-вопрос добавлен на канвас
**When** нода отображается
**Then** автоматически создаются 3 выходных узла: detractor (0-6), passive (7-8), promoter (9-10) (FR10)

**Given** закрытый вопрос добавлен на канвас
**When** нода отображается
**Then** автоматически создаются выходные узлы по количеству вариантов ответа (FR10)

**Given** открытый вопрос добавлен на канвас
**When** нода отображается
**Then** создаётся 1 выходной узел (default) (FR10)

**Given** два вопроса на канвасе
**When** пользователь drag от выходного узла одной ноды к другой ноде
**Then** создаётся ребро (связь), визуально отрисовывается (FR9)

**Given** нода или ребро на канвасе
**When** пользователь удаляет элемент (клавиша Delete или кнопка)
**Then** элемент удаляется с канваса (FR11)

**Given** нода на канвасе
**When** пользователь кликает по ноде
**Then** открывается боковая панель (Sheet 360px) справа с настройками: текст вопроса, тип, варианты (FR12, UX-DR11)
**And** панель закрывается по Esc, клику вне, кнопке "×"

**Given** Zustand store создан (surveyFlowStore)
**When** пользователь изменяет граф (добавление/удаление/перемещение)
**Then** state обновляется в Zustand (nodes, edges)
**And** immutable updates (AR15)

### Story 3.4: Frontend — сохранение и загрузка графа

As a пользователь,
I want чтобы мой граф автоматически сохранялся и загружался,
So that я не потеряю работу над опросом.

**Acceptance Criteria:**

**Given** пользователь изменил граф (добавил/удалил/переместил ноды)
**When** нажимает кнопку "Сохранить" в тулбаре
**Then** Zustand state (nodes, edges) отправляется на PUT /api/v1/surveys/:id/flow
**And** React Query invalidation обновляет серверный state
**And** toast "Сохранено" на 3 секунды

**Given** пользователь открывает /surveys/[id]/builder
**When** страница загружается
**Then** flow загружается через GET /api/v1/surveys/:id
**And** nodes и edges из JSONB восстанавливаются в Zustand store
**And** канвас отображает граф в сохранённом состоянии

**Given** пользователь открывает конструктор
**When** данные загружаются
**Then** отображается skeleton loading до готовности канваса (UX-DR13)

**Given** ошибка при сохранении
**When** API возвращает ошибку
**Then** отображается toast с сообщением об ошибке (не исчезает автоматически)

### Story 3.5: Валидация флоу — обнаружение ошибок и подсветка

As a пользователь,
I want валидировать граф опроса перед запуском,
So that респонденты не столкнутся с тупиками или зацикливанием.

**Acceptance Criteria:**

**Given** граф собран
**When** пользователь нажимает "Валидация" в тулбаре
**Then** вызывается flow-validator из packages/shared (AR13)
**And** результат отображается в ValidationAlert в тулбаре (UX-DR8)

**Given** граф содержит ноду без исходящих рёбер (не ThankYouNode)
**When** запускается валидация
**Then** обнаруживается тупик (FR14)
**And** проблемная нода подсвечивается coral-цветом (rose-400) (FR16)

**Given** граф содержит цикл (нода A → B → C → A)
**When** запускается валидация
**Then** обнаруживается цикл (FR15)
**And** ноды и рёбра цикла подсвечиваются coral-цветом (FR16)

**Given** WelcomeNode не соединена ни с одной нодой
**When** запускается валидация
**Then** обнаруживается ошибка "Стартовая нода не соединена"

**Given** валидация обнаружила ошибки
**When** отображается ValidationAlert
**Then** показывается список ошибок с типом и описанием каждой (UX-DR8)
**And** клик на ошибку центрирует канвас на проблемной ноде

**Given** валидация пройдена успешно
**When** отображается ValidationAlert
**Then** показывается зелёное сообщение "Флоу валиден" (UX-DR8)

**Given** граф невалиден
**When** backend получает запрос на активацию опроса (из будущего Epic 4)
**Then** валидация выполняется на сервере (тот же flow-validator из shared)
**And** активация блокируется, возвращается 400 с errorCode SURVEY_FLOW_INVALID и списком ошибок (FR17)

**Given** валидация флоу выполняется
**When** граф содержит до 50 нод
**Then** валидация завершается за < 1 секунду (NFR5)

## Epic 4: Жизненный цикл опроса и распространение

Пользователь может управлять жизненным циклом опроса (Draft→Active→Completed→Archived), добавлять респондентов по email, получать персональные ссылки, отслеживать статусы прохождения и drop-off.

### Story 4.1: Backend — жизненный цикл опроса

As a пользователь,
I want управлять статусом опроса с чёткими бизнес-правилами,
So that опросы проходят корректный жизненный цикл и данные защищены.

**Acceptance Criteria:**

**Given** опрос в статусе draft с валидным flow
**When** POST /api/v1/surveys/:id/activate
**Then** статус меняется на active (FR18)
**And** flow валидируется на сервере перед активацией (FR17)

**Given** опрос в статусе draft с невалидным flow
**When** POST /api/v1/surveys/:id/activate
**Then** возвращается 400 с errorCode SURVEY_FLOW_INVALID и списком ошибок

**Given** опрос в статусе active
**When** POST /api/v1/surveys/:id/complete
**Then** статус меняется на completed (FR19)

**Given** опрос в статусе completed
**When** POST /api/v1/surveys/:id/archive
**Then** статус меняется на archived (FR20)

**Given** опрос в статусе completed
**When** POST /api/v1/surveys/:id/activate
**Then** возвращается 409 с errorCode SURVEY_CANNOT_REACTIVATE (FR21)

**Given** опрос в любом статусе
**When** DELETE /api/v1/surveys/:id
**Then** возвращается 403 с errorCode SURVEY_DELETE_FORBIDDEN (FR22)

**Given** невалидный переход статуса (например, archived → active)
**When** выполняется попытка перехода
**Then** возвращается 409 с errorCode SURVEY_INVALID_TRANSITION

**Given** существуют опросы
**When** GET /api/v1/surveys?search=NPS&page=1&limit=10
**Then** возвращается список с поиском по названию и пагинацией (FR23)

### Story 4.2: Backend — управление респондентами и генерация ссылок

As a пользователь,
I want добавлять респондентов и получать персональные ссылки для рассылки,
So that я могу распространить опрос среди своих клиентов.

**Acceptance Criteria:**

**Given** опрос в статусе active
**When** POST /api/v1/surveys/:id/respondents с {email: "client@example.com"}
**Then** респондент создаётся с уникальным UUID v4 токеном (FR24, FR25, NFR8)
**And** возвращается {data: {id, email, token, link, status}, meta: {}}

**Given** опрос в статусе active
**When** POST /api/v1/surveys/:id/respondents с {emails: ["a@b.com", "c@d.com"]}
**Then** респонденты создаются batch, каждый с уникальным UUID v4 токеном

**Given** респондент с email уже добавлен в этот опрос
**When** POST /api/v1/surveys/:id/respondents с тем же email
**Then** возвращается 409 с errorCode RESPONDENT_ALREADY_EXISTS (FR26)

**Given** респонденты добавлены
**When** GET /api/v1/surveys/:id/respondents?page=1&limit=10&search=client
**Then** возвращается список с пагинацией и поиском по email (FR27)

**Given** респондент создан
**When** проверяется начальный статус
**Then** статус = not_opened (FR28)

**Given** респондент открывает ссылку (будущий Epic 5)
**When** статус обновляется
**Then** переходы: not_opened → opened → in_progress → completed (FR28)

**Given** респондент начал, но не завершил опрос
**When** проверяется статус
**Then** статус = in_progress, фиксируется последний отвеченный вопрос для трекинга drop-off (FR29)

**Given** опрос не в статусе active
**When** POST /api/v1/surveys/:id/respondents
**Then** возвращается 409 с errorCode SURVEY_NOT_ACTIVE

### Story 4.3: Frontend — список опросов, lifecycle и SurveyCard

As a пользователь,
I want видеть все опросы как карточки с возможностью управления их статусом,
So that я могу быстро оценить состояние и управлять каждым опросом.

**Acceptance Criteria:**

**Given** пользователь аутентифицирован
**When** открывает /surveys
**Then** отображаются SurveyCard в grid-layout: название + дата + кол-во вопросов + badge статуса (UX-DR5)
**And** при наличии респондентов показывается мини-статистика (респонденты, завершили)

**Given** SurveyCard отображается
**When** проверяются badge статусов
**Then** Draft: slate-100/slate-600, Active: emerald-100/emerald-700, Completed: sky-100/sky-700, Archived: slate-100/slate-400 (UX-DR9)

**Given** SurveyCard для Draft-опроса
**When** пользователь наводит курсор
**Then** shadow увеличивается (hover state) (UX-DR5)
**And** клик ведёт на /surveys/[id]/builder (UX-DR16)

**Given** SurveyCard для Active/Completed-опроса
**When** пользователь кликает
**Then** ведёт на /surveys/[id]/analytics (UX-DR16)

**Given** опрос в статусе draft
**When** пользователь нажимает "Активировать"
**Then** confirm dialog: "Опрос будет запущен. Респонденты смогут проходить его."
**And** при подтверждении вызывается API activate, карточка обновляется (FR18)

**Given** опрос в статусе active
**When** пользователь нажимает "Завершить"
**Then** confirm dialog с предупреждением, при подтверждении — API complete (FR19)

**Given** опрос в статусе completed
**When** пользователь нажимает "Архивировать"
**Then** confirm dialog, при подтверждении — API archive (FR20)

**Given** страница опросов
**When** пользователь вводит текст в поле поиска
**Then** карточки фильтруются по названию с debounce 300ms (FR23)

### Story 4.4: Frontend — страница респондентов опроса

As a пользователь,
I want добавлять респондентов и отслеживать их статусы,
So that я могу управлять рассылкой и видеть прогресс сбора ответов.

**Acceptance Criteria:**

**Given** пользователь на /surveys/[id]/respondents
**When** страница загружается
**Then** отображается таблица респондентов: email, статус (badge), дата добавления (FR27)
**And** пагинация и поиск по email

**Given** опрос в статусе active
**When** пользователь вводит email и нажимает "Добавить"
**Then** респондент создаётся через API, таблица обновляется (FR24)
**And** toast "Респондент добавлен"

**Given** поле ввода email
**When** пользователь вводит несколько email через запятую ("a@b.com, c@d.com")
**Then** все респонденты добавляются batch (UX-DR15)

**Given** email уже добавлен в этот опрос
**When** пользователь пытается добавить тот же email
**Then** inline-ошибка "Этот email уже добавлен" под полем (FR26, UX-DR15)

**Given** невалидный формат email
**When** пользователь нажимает "Добавить"
**Then** inline-ошибка "Некорректный email" под полем

**Given** респондент в таблице
**When** пользователь нажимает кнопку копирования ссылки
**Then** персональная ссылка копируется в буфер обмена
**And** toast "Ссылка скопирована"

**Given** статусы респондентов
**When** отображаются в таблице
**Then** not_opened: серый badge, opened: синий, in_progress: amber, completed: зелёный (FR28)

**Given** опрос не в статусе active
**When** пользователь на странице респондентов
**Then** форма добавления респондентов скрыта или disabled

## Epic 5: Прохождение опроса респондентом

Респонденты могут пройти опрос по персональной ссылке — welcome-экран, пошаговый формат (один вопрос за раз), прогресс-бар, бранчинг, mobile-friendly интерфейс, экран «Спасибо».

### Story 5.1: Backend — публичный API прохождения опроса

As a респондент,
I want пройти опрос по персональной ссылке,
So that я могу поделиться своим мнением быстро и удобно.

**Acceptance Criteria:**

**Given** респондент с валидным UUID токеном
**When** GET /api/v1/respond/:token
**Then** возвращается информация об опросе: название, описание, первый вопрос (на основе flow graph от WelcomeNode)
**And** эндпоинт не требует аутентификации (@Public) (NFR9)
**And** статус респондента обновляется на opened (FR28)

**Given** респондент ответил на вопрос
**When** POST /api/v1/respond/:token/answer с {questionId, answer}
**Then** ответ сохраняется в БД (FR37)
**And** статус респондента обновляется на in_progress (FR28)
**And** возвращается следующий вопрос на основе бранчинга (ответ определяет следующую ноду по flow graph)

**Given** респондент на NPS-вопросе и ответил 3 (detractor)
**When** POST /api/v1/respond/:token/answer с {questionId, answer: 3}
**Then** следующий вопрос определяется по ребру detractor выхода (бранчинг работает)

**Given** респондент ответил на последний вопрос в ветке (следующая нода — ThankYouNode)
**When** POST /api/v1/respond/:token/answer
**Then** статус респондента обновляется на completed (FR28)
**And** возвращается {data: {completed: true}, meta: {}}

**Given** невалидный UUID токен
**When** GET /api/v1/respond/:token
**Then** возвращается 404 с errorCode RESPONDENT_NOT_FOUND

**Given** респондент уже завершил опрос (статус completed)
**When** GET /api/v1/respond/:token
**Then** возвращается 410 с errorCode SURVEY_ALREADY_COMPLETED

**Given** опрос не в статусе active (completed или archived)
**When** GET /api/v1/respond/:token
**Then** возвращается 410 с errorCode SURVEY_NOT_ACTIVE

**Given** респондент в статусе in_progress (прервал ранее)
**When** GET /api/v1/respond/:token
**Then** возвращается следующий неотвеченный вопрос (продолжение с места остановки)

### Story 5.2: Frontend — welcome, прохождение и thank you

As a респондент,
I want понятный и приятный интерфейс прохождения опроса,
So that я могу быстро ответить на вопросы без затруднений.

**Acceptance Criteria:**

**Given** респондент открывает /respond/[token]
**When** токен валиден и опрос active
**Then** отображается welcome-экран: название опроса, описание, количество вопросов, примерное время прохождения, кнопка "Начать опрос" (FR30)

**Given** респондент нажимает "Начать опрос"
**When** загружается первый вопрос
**Then** отображается RespondentCard: текст вопроса + элемент ответа + кнопка "Далее" (FR31)

**Given** вопрос типа NPS
**When** отображается RespondentCard
**Then** сетка кнопок 0-10 с подписями "Совсем нет" / "Обязательно" (UX-DR6)
**And** кнопки 40-48px, touch-friendly

**Given** вопрос типа открытый
**When** отображается RespondentCard
**Then** Textarea для свободного ответа (UX-DR6)

**Given** вопрос типа закрытый
**When** отображается RespondentCard
**Then** RadioGroup с вариантами ответа, вся строка кликабельна (UX-DR6)

**Given** вопрос типа матричный
**When** отображается RespondentCard
**Then** таблица с RadioGroup в каждой строке (UX-DR6)

**Given** вопрос типа мульти-селект
**When** отображается RespondentCard
**Then** Checkbox группа с вариантами (UX-DR6)

**Given** респондент не выбрал ответ
**When** проверяется кнопка "Далее"
**Then** кнопка disabled (empty state) (UX-DR6)

**Given** респондент выбрал ответ
**When** нажимает "Далее"
**Then** кнопка переходит в submitting state (disabled + "Отправка...")
**And** ответ отправляется на backend (FR37)
**And** отображается следующий вопрос по бранчингу

**Given** респондент ответил на последний вопрос
**When** backend возвращает completed: true
**Then** отображается экран "Спасибо": благодарность, "Ваши ответы сохранены" (FR35)

**Given** невалидный или просроченный токен
**When** респондент открывает ссылку
**Then** отображается экран "Опрос не найден или уже завершён"

**Given** респондент уже прошёл опрос
**When** открывает ссылку повторно
**Then** отображается экран "Вы уже прошли этот опрос, спасибо!"

### Story 5.3: Frontend — прогресс-бар, навигация, localStorage и mobile

As a респондент,
I want видеть прогресс прохождения и не потерять ответы при сбое,
So that я уверен в процессе и могу продолжить с того места, где остановился.

**Acceptance Criteria:**

**Given** респондент проходит опрос
**When** отображается прогресс-бар
**Then** показывает "Вопрос X из Y" где Y — длина текущего пути с учётом бранчинга (FR32)
**And** Progress компонент визуально заполняется пропорционально

**Given** респондент на любом вопросе
**When** проверяется навигация
**Then** доступна только кнопка "Далее" (навигация только вперёд, нет кнопки "Назад") (FR33)

**Given** респондент ответил на вопрос
**When** ответ успешно отправлен
**Then** прогресс (текущий questionId, список отвеченных) сохраняется в localStorage (FR34)

**Given** респондент закрыл браузер и вернулся по ссылке
**When** страница загружается
**Then** localStorage проверяется, если прогресс есть — продолжение с последнего неотвеченного вопроса (FR34)
**And** backend подтверждает прогресс (localStorage синхронизирован с сервером)

**Given** интерфейс респондента на мобильном (<640px)
**When** отображается карточка
**Then** карточка full-width с padding 16px, без border-radius (UX-DR12, UX-DR20)
**And** кнопка "Далее" full-width, height 48px
**And** NPS кнопки 40px с gap 4px
**And** текст вопроса 16px

**Given** интерфейс респондента на десктопе (≥640px)
**When** отображается карточка
**Then** карточка центрирована, max-width 480px, padding 24px, rounded-xl, shadow (UX-DR12)
**And** NPS кнопки 48px
**And** текст вопроса 20px

**Given** все интерактивные элементы на мобильном
**When** проверяются touch targets
**Then** минимум 44x44px для кнопок, radio, checkbox (UX-DR19)

**Given** интерфейс респондента загружает следующий вопрос
**When** backend отвечает
**Then** следующий вопрос появляется за < 1 секунду (NFR4)

## Epic 6: Аналитика и инсайты

Пользователь может анализировать результаты опросов — NPS score и breakdown, распределение ответов по вопросам, heatmap путей на графе, satisfaction matrix, фильтры по дате/респонденту/ветке, просмотр полного пути конкретного респондента.

### Story 6.1: Backend — агрегация аналитики

As a пользователь,
I want API с агрегированной аналитикой по каждому опросу,
So that frontend может отображать метрики, графики и heatmap.

**Acceptance Criteria:**

**Given** AnalyticsModule создан (repository, service, controller)
**When** GET /api/v1/surveys/:id/analytics/summary
**Then** возвращается: totalRespondents, completedRespondents, completionRate, averageNps
**And** npsBreakdown: {detractors: count, passives: count, promoters: count, detractorPercent, passivePercent, promoterPercent} (FR38)

**Given** опрос с ответами
**When** GET /api/v1/surveys/:id/analytics/distribution
**Then** возвращается распределение ответов по каждому вопросу
**And** для NPS: количество по каждой оценке 0-10
**And** для закрытого/мульти-селект: количество по каждому варианту
**And** для открытого: список текстовых ответов (FR39)

**Given** опрос с ответами
**When** GET /api/v1/surveys/:id/analytics/heatmap
**Then** возвращается для каждой ноды: nodeId, respondentCount
**And** для каждого ребра: edgeId, traversalCount, dropOffCount
**And** данные достаточны для визуализации толщины/цвета рёбер (FR41)

**Given** опрос с ответами
**When** GET /api/v1/surveys/:id/analytics/satisfaction
**Then** возвращается satisfaction matrix: категории вопросов × средний балл/распределение (FR40)

**Given** эндпоинты аналитики
**When** запрос с query params ?dateFrom=...&dateTo=...&respondentId=...
**Then** данные фильтруются по указанным параметрам (FR42)

**Given** конкретный респондент
**When** GET /api/v1/surveys/:id/analytics/respondents/:respondentId/path
**Then** возвращается полный путь: последовательность вопросов + ответы + timestamps (FR43)

**Given** опрос с до 500 ответами
**When** запрашивается любой эндпоинт аналитики
**Then** ответ возвращается за < 3 секунды (NFR3)

**Given** опрос без ответов
**When** запрашивается аналитика
**Then** возвращаются нулевые значения (не ошибка)

### Story 6.2: Frontend — дашборд аналитики и NPS

As a пользователь,
I want видеть ключевые метрики и распределение ответов по опросу,
So that я могу быстро оценить результаты и уровень удовлетворённости клиентов.

**Acceptance Criteria:**

**Given** пользователь на /surveys/[id]/analytics
**When** вкладка "Метрики" активна (по умолчанию)
**Then** отображаются карточки метрик (Card, grid 3 колонки): респонденты, завершили, completion rate (FR38)
**And** данные загружаются через React Query с skeleton loading

**Given** вкладка "Метрики"
**When** отображается NPS секция
**Then** NpsGauge показывает: крупное число NPS (-100..+100) слева + stacked bar (detractor красный / passive жёлтый / promoter зелёный) справа + проценты (UX-DR7)

**Given** вкладка "Метрики"
**When** отображается распределение ответов
**Then** для каждого вопроса показывается Recharts bar chart или pie chart (FR39)
**And** NPS: bar chart по оценкам 0-10
**And** закрытый/мульти-селект: bar chart по вариантам
**And** открытый: список текстовых ответов

**Given** опрос без ответов
**When** вкладка "Метрики"
**Then** EmptyState: "Ожидание ответов" с пояснением (UX-DR13)

**Given** вкладки аналитики
**When** пользователь переключает
**Then** три вкладки: Метрики | Heatmap | Респонденты (UX-DR16, Tabs shadcn/ui)

### Story 6.3: Frontend — heatmap на графе

As a пользователь,
I want видеть пути респондентов прямо на графе опроса,
So that я могу найти проблемные ветки и понять, как люди проходят мой опрос.

**Acceptance Criteria:**

**Given** вкладка "Heatmap" активна
**When** данные загружены
**Then** отображается React Flow граф опроса в read-only режиме (без drag, без редактирования)
**And** ноды показывают счётчик респондентов (FR41)

**Given** рёбра графа на heatmap
**When** отображаются HeatmapEdge
**Then** толщина ребра пропорциональна трафику: thin 1-2px (мало), medium 3-4px, thick 5-6px (много) (UX-DR4)
**And** цвет: градиент slate-200 → blue-300 → blue-600 по объёму трафика

**Given** респондент начал, но не завершил путь по ребру
**When** отображается drop-off
**Then** ребро отрисовывается пунктирной rose-300 линией (UX-DR4)

**Given** heatmap отображается
**When** проверяется легенда
**Then** отображается легенда: толщина рёбер, цветовой градиент, пунктир = drop-off

**Given** нода на heatmap
**When** пользователь кликает по ноде
**Then** открывается боковая панель (Sheet) с детализацией: количество респондентов, распределение ответов для этого вопроса

**Given** вкладка "Метрики" (или отдельная секция)
**When** отображается satisfaction matrix
**Then** таблица/heatmap: строки — категории вопросов, колонки — метрики (средний балл, распределение) (FR40)

**Given** heatmap загружается для опроса с до 500 ответами
**When** данные агрегированы
**Then** отображение происходит за < 3 секунды (NFR3)

### Story 6.4: Frontend — фильтры и drill-down по респонденту

As a пользователь,
I want фильтровать аналитику и просматривать путь конкретного респондента,
So that я могу находить паттерны и понимать индивидуальный опыт клиентов.

**Acceptance Criteria:**

**Given** страница аналитики
**When** пользователь нажимает "Фильтры"
**Then** отображается dropdown-панель с фильтрами: диапазон дат, респондент (select), ветка флоу (select) (FR42, UX-DR18)

**Given** фильтры применены
**When** отображается страница аналитики
**Then** активные фильтры показываются как badges рядом с кнопкой "Фильтры" (UX-DR18)
**And** все метрики, графики и heatmap пересчитываются с учётом фильтров

**Given** фильтр по конкретному респонденту
**When** применён
**Then** heatmap подсвечивает только путь этого респондента

**Given** вкладка "Респонденты" активна
**When** отображается таблица
**Then** колонки: email, статус (badge), NPS оценка, время прохождения
**And** пагинация и поиск по email

**Given** респондент в таблице
**When** пользователь кликает по строке
**Then** отображается полный путь: последовательность вопросов → ответы → timestamps (FR43)
**And** визуально как timeline/список шагов

**Given** фильтр по дате применён
**When** диапазон дат не содержит ответов
**Then** EmptyState: "Нет данных за выбранный период"

**Given** пользователь хочет сбросить фильтры
**When** нажимает "×" на badge фильтра или "Сбросить всё"
**Then** фильтры очищаются, данные обновляются
