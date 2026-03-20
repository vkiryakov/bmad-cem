---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-03-20'
lastStep: 8
inputDocuments:
  - planning-artifacts/product-brief-bmad-cem-2026-03-20.md
  - planning-artifacts/prd.md
  - planning-artifacts/ux-design-specification.md
  - planning-artifacts/research/domain-cem-feedback-platforms-research-2026-03-20.md
workflowType: 'architecture'
project_name: 'bmad-cem'
user_name: 'vkiryakov'
date: '2026-03-20'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Функциональные требования (48 FR в 8 категориях):**
- Библиотека вопросов (FR1-FR6): CRUD с 5 типами вопросов, фильтрация, защита от редактирования при наличии ответов
- Конструктор опросов (FR7-FR13): React Flow граф, добавление вопросов из библиотеки, типизированные выходы, бранчинг
- Валидация флоу (FR14-FR17): обнаружение тупиков и циклов, подсветка ошибок, блокировка активации
- Жизненный цикл опроса (FR18-FR23): Draft → Active → Completed → Archived, запрет обратных переходов и удаления
- Распространение (FR24-FR29): ручной ввод респондентов, персональные UUID-ссылки, трекинг статусов и drop-off
- UX респондента (FR30-FR37): welcome-экран, пошаговый формат, прогресс-бар, mobile-friendly, localStorage, отправка каждого ответа отдельно
- Аналитика (FR38-FR43): NPS дашборд, распределение ответов, heatmap на графе, satisfaction matrix, фильтры
- Аутентификация и UI (FR44-FR48): дефолтный пользователь, JWT, пагинация, светлая тема

**Нефункциональные требования (10 NFR):**
- Performance: страницы < 2 сек, граф до 50 нод, аналитика < 3 сек (500 ответов), следующий вопрос < 1 сек
- Security: JWT с TTL, rate limiting на логин, UUID v4 ссылки, HTTPS

**UX-спецификация:**
- Два изолированных UX-контекста: desktop-only админка и mobile-first респондент
- React Flow граф-конструктор с кастомными нодами (5 типов) и кастомными рёбрами (heatmap)
- 8 кастомных компонентов: SurveyNode, WelcomeNode, ThankYouNode, HeatmapEdge, SurveyCard, RespondentCard, NpsGauge, ValidationAlert
- shadcn/ui + Tailwind CSS как дизайн-система
- Визуальный стиль: slate палитра, Inter, rounded-xl, компактный layout

### Scale & Complexity

- **Primary domain:** Full-stack web (Next.js + NestJS + PostgreSQL)
- **Complexity level:** Low-Medium
- **Estimated architectural components:** ~15-20 (backend modules, frontend pages/features, shared packages)
- **Real-time features:** нет (polling или refresh для обновления аналитики)
- **Multi-tenancy:** нет в MVP, запланировано в Phase 2
- **Regulatory compliance:** нет в MVP (GDPR out of scope)
- **Integration complexity:** нет внешних интеграций в MVP
- **User interaction complexity:** высокая на фронтенде (React Flow граф-конструктор), низкая на бэкенде
- **Data complexity:** средняя (JSONB для графа, связи вопросы-ответы-респонденты)

### Technical Constraints & Dependencies

- **Monorepo:** Turborepo с структурой apps/web, apps/api, packages/ui, packages/shared
- **Frontend:** Next.js + React Flow + shadcn/ui + Tailwind + React Query
- **Backend:** NestJS + TypeORM + PostgreSQL
- **API:** REST, internal only (frontend ↔ backend), Swagger/OpenAPI
- **Auth:** Дефолтный пользователь (admin/123), JWT
- **Storage:** Flow опроса — JSONB в PostgreSQL
- **CI/CD:** GitHub Actions
- **Resource constraint:** Solo-developer — архитектура должна быть простой и поддерживаемой одним человеком

### Cross-Cutting Concerns Identified

- **Валидация графа:** затрагивает frontend (визуальная подсветка ошибок) и backend (блокировка активации невалидного опроса). Алгоритмы обнаружения тупиков и циклов нужны в обоих слоях.
- **Защита целостности данных:** пронизывает все модули — вопросы с ответами immutable, опросы не удаляются, lifecycle transitions только вперёд. Требует constraints на уровне БД и бизнес-логики.
- **Два UI-контекста:** админка (desktop-only, аутентифицированная) и респондент (mobile-first, публичная по UUID). Разные требования к responsive, accessibility, security. Влияет на routing, middleware, компонентную архитектуру.
- **Аналитика на графе:** heatmap требует агрегации данных ответов + визуализации на React Flow. Пересекает backend (агрегация) и frontend (кастомные рёбра/ноды).

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web (Next.js + NestJS) в Turborepo monorepo

### Starter Options Considered

| Вариант | Плюсы | Минусы | Решение |
|---|---|---|---|
| `create-turbo` + custom | Чистая база, полный контроль | Ручная настройка NestJS и shared | ✅ Выбран |
| `ejazahm3d/fullstack-turborepo-starter` | Next.js + NestJS + Docker + GH Actions | Prisma вместо TypeORM, устаревшие версии | ❌ |
| `next-forge` | Production SaaS шаблон | Монолитный Next.js, нет NestJS | ❌ |
| `gmickel/turborepo-shadcn-nextjs` | shadcn/ui + Turborepo | Нет backend, Bun вместо pnpm | ❌ |

### Selected Starter: Custom setup на базе create-turbo

**Rationale:**
Ни один готовый стартер не совпадает со стеком (Next.js + NestJS + TypeORM + shadcn/ui + React Flow). Комбинированный подход из официальных CLI-инструментов даёт чистую базу без лишних зависимостей и полный контроль над структурой. Solo-developer — проще начать с минимума и добавлять по необходимости, чем вычищать чужой boilerplate.

**Initialization Commands:**

```bash
# Monorepo skeleton
npx create-turbo@latest bmad-cem --package-manager=pnpm

# Frontend
npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir

# Design system
cd apps/web && npx shadcn@latest init

# Backend
npx @nestjs/cli new apps/api --package-manager=pnpm --strict
```

**Architectural Decisions Provided:**

- **Language & Runtime:** TypeScript 5.x, strict mode, Node.js LTS
- **Styling:** Tailwind CSS v4 + shadcn/cli v4 (Radix UI primitives)
- **Build Tooling:** Turborepo pipeline, Turbopack (Next.js), tsc (NestJS)
- **Package Manager:** pnpm workspaces
- **Code Organization:** apps/ (deployable) + packages/ (shared libraries)
- **Development Experience:** `turbo dev` — параллельный запуск frontend и backend с hot reload

**Infrastructure:**

- **Database (dev):** PostgreSQL через Docker Compose (единственный сервис)
- **Dev workflow:** `turbo dev` запускает apps/web и apps/api параллельно
- **Shared contracts:** `packages/shared` — DTO, enum, интерфейсы API, импортируется обоими apps

**Current Verified Versions (March 2026):**

| Package | Version |
|---|---|
| Next.js | 16.2 |
| NestJS | 11.1.17 |
| Turborepo | 2.8.13 |
| @xyflow/react | 12.10.1 |
| shadcn/cli | v4 |
| TypeORM | 0.3.28 |
| TypeScript | 5.x |

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Strict layering: Controller → Service → Repository
- Mapper utility для entity ↔ DTO маппинга
- Shared error codes в packages/shared
- API versioning (/api/v1/...)
- Валидация всех входящих запросов
- Stateless приложение

**Important Decisions (Shape Architecture):**
- Zustand для frontend state management
- React Hook Form для форм
- Recharts для аналитики
- JWT access token 24h без refresh tokens

**Deferred Decisions (Post-MVP):**
- Кэширование
- Rate limiting (throttler)
- Production deployment strategy
- CI/CD pipeline (GitHub Actions)
- Миграции БД (synchronize: true на MVP)

### Data Architecture

- **ORM:** TypeORM 0.3.28, synchronize: true (без миграций на MVP)
- **Flow storage:** JSONB-колонка в таблице `surveys` (не отдельная таблица)
- **Validation:** class-validator + class-transformer (NestJS ValidationPipe глобально)
- **Caching:** нет на MVP

**Rationale:** Synchronize упрощает итерации на этапе активной разработки. JSONB в surveys — граф всегда загружается вместе с опросом, отдельная таблица не даёт преимуществ. Кэш не нужен при одном пользователе и до 500 ответов.

### Authentication & Security

- **JWT:** @nestjs/jwt + @nestjs/passport + passport-jwt
- **Token strategy:** Один access token, TTL 24 часа, без refresh tokens
- **Guards:** Глобальный JwtAuthGuard на все admin API эндпоинты
- **Public endpoints:** Декоратор @Public() для эндпоинтов респондента (доступ по UUID)
- **Rate limiting:** Отложено на post-MVP
- **Ссылки респондентов:** UUID v4 (непредсказуемые)

**Rationale:** Single-user MVP — длинный TTL без refresh tokens достаточен. Глобальный guard + @Public() — простой и надёжный паттерн. Rate limiting не критичен для single-user.

### API & Communication Patterns

- **Versioning:** Обязательно. Формат: `/api/v1/...`
- **Error format:** Расширенный HttpException:
  ```json
  {
    "statusCode": 400,
    "message": "Human-readable message",
    "errorCode": "SURVEY_ALREADY_ACTIVE",
    "error": "Bad Request"
  }
  ```
- **Error codes:** Enum в `packages/shared`, импортируется frontend и backend
- **Validation:** Глобальный ValidationPipe, все входящие запросы проверяются на обязательные поля
- **Documentation:** @nestjs/swagger с авто-генерацией из DTO
- **Stateless:** Приложение полностью stateless, нет server-side sessions

**Rationale:** Версионирование — защита от breaking changes при эволюции API. Error codes в shared пакете — frontend может обрабатывать ошибки программно, без парсинга текстовых сообщений. Stateless — упрощает масштабирование в Phase 2.

### Backend Architecture

- **Strict layering:** Controller → Service → Repository
- **Controller:** Принимает HTTP-запрос, валидация DTO, вызов сервиса, возврат ответа
- **Service:** Бизнес-логика, оркестрация. НЕ знает деталей реализации репозитория. Не содержит SQL/QueryBuilder
- **Repository:** Все запросы к БД. TypeORM custom repositories. Единственный слой, знающий о структуре БД
- **Mapper:** Отдельный utility-класс для маппинга Entity ↔ DTO. Не в сервисе, не в контроллере — выделенный Mapper
- **Module structure:** NestJS модули по доменам: SurveyModule, QuestionModule, RespondentModule, AnalyticsModule, AuthModule

**Rationale:** Строгое разделение слоёв предотвращает утечку абстракций. Mapper изолирует трансформацию данных и не засоряет бизнес-логику. Repository pattern позволяет менять реализацию хранения без изменения сервисного слоя.

### Frontend Architecture

- **State management:** Zustand для глобального state (граф-конструктор, UI state)
- **Server state:** TanStack Query (React Query) для серверных данных
- **Forms:** React Hook Form
- **Charts:** Recharts (гистограммы, pie charts, NPS gauge)
- **Graph:** @xyflow/react 12.10.1 (React Flow) с кастомными нодами и рёбрами
- **Routing:** Next.js App Router

**Rationale:** Zustand — легковесный, рекомендован React Flow для сложных графов. React Query разделяет server/client state. React Hook Form — стандарт для производительных форм. Recharts — declarative API, хорошо интегрируется с React.

### Infrastructure & Deployment

- **Environment:** .env файлы + @nestjs/config (ConfigModule) на backend, .env.local на frontend
- **Database (dev):** PostgreSQL через Docker Compose (единственный сервис)
- **Dev workflow:** `turbo dev` запускает apps/web и apps/api параллельно
- **Logging:** NestJS встроенный Logger
- **CI/CD:** Отложено (GitHub Actions не нужны на MVP)
- **Production deployment:** Отложено

**Rationale:** Минимальная инфраструктура для solo-developer MVP. Docker Compose только для PostgreSQL — приложение запускается нативно через turbo dev.

### Decision Impact Analysis

**Implementation Sequence:**
1. Monorepo setup (Turborepo + pnpm)
2. Docker Compose + PostgreSQL
3. apps/api: NestJS + TypeORM + ConfigModule + JWT
4. packages/shared: Error codes, DTO interfaces, API contracts
5. apps/web: Next.js + shadcn/ui + Zustand + React Query
6. React Flow граф-конструктор
7. Аналитика (Recharts + heatmap)

**Cross-Component Dependencies:**
- `packages/shared` → импортируется и apps/web, и apps/api (error codes, DTO, типы)
- Mapper (backend) зависит от Entity (TypeORM) и DTO (shared)
- React Flow state (Zustand) синхронизируется с server state (React Query) при сохранении графа
- Валидация графа: алгоритм в packages/shared, используется и frontend (подсветка), и backend (блокировка активации)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 25+ областей, где AI-агенты могут принять разные решения

### Naming Patterns

**Database Naming Conventions:**
- Таблицы: `snake_case`, множественное число — `surveys`, `questions`, `respondents`, `responses`
- Колонки: `snake_case` — `created_at`, `survey_id`, `question_type`
- Foreign keys: `{table_singular}_id` — `survey_id`, `question_id`
- Индексы: `idx_{table}_{column}` — `idx_surveys_status`, `idx_respondents_token`
- Enum types: `snake_case` — `survey_status`, `question_type`

**API Naming Conventions:**
- Endpoints: `kebab-case`, множественное число — `/api/v1/surveys`, `/api/v1/questions`
- Route params: `:id` — `/api/v1/surveys/:id`
- Query params: `camelCase` — `?questionType=nps&page=1`
- Nested resources: `/api/v1/surveys/:id/respondents`

**Code Naming Conventions (Backend):**
- Файлы: `kebab-case` с суффиксом роли — `survey.service.ts`, `survey.controller.ts`, `survey.repository.ts`, `survey.mapper.ts`
- Классы: `PascalCase` — `SurveyService`, `SurveyMapper`, `CreateSurveyDto`
- Переменные/функции: `camelCase` — `getSurveyById`, `surveyStatus`
- Entity: `PascalCase`, singular — `Survey`, `Question`, `Response`
- DTO: `PascalCase` с префиксом действия — `CreateSurveyDto`, `UpdateQuestionDto`, `SurveyResponseDto`
- Enums: `PascalCase` — `SurveyStatus`, `QuestionType`, `ErrorCode`

**Code Naming Conventions (Frontend):**
- Компоненты: `PascalCase` файлы — `SurveyNode.tsx`, `RespondentCard.tsx`
- Hooks: `camelCase` с `use` — `useSurveyStore.ts`, `useQuestions.ts`
- Stores (Zustand): `camelCase` — `surveyFlowStore.ts`
- Utils/lib: `camelCase` — `apiClient.ts`, `formatDate.ts`
- Pages (Next.js App Router): `kebab-case` папки — `app/surveys/[id]/page.tsx`

### Structure Patterns

**Backend Module Structure (NestJS):**
```
apps/api/src/modules/{domain}/
├── {domain}.module.ts
├── {domain}.controller.ts
├── {domain}.service.ts
├── {domain}.service.spec.ts        # Co-located test
├── {domain}.repository.ts
├── {domain}.repository.spec.ts     # Co-located test
├── {domain}.mapper.ts
├── dto/
│   ├── create-{domain}.dto.ts
│   └── update-{domain}.dto.ts
└── entities/
    └── {domain}.entity.ts
```

**Backend Modules:**
- `auth/` — AuthModule: login, JWT, guards
- `survey/` — SurveyModule: CRUD опросов, flow (JSONB), lifecycle
- `question/` — QuestionModule: CRUD вопросов, защита от редактирования
- `respondent/` — RespondentModule: управление респондентами, UUID-ссылки, трекинг статусов
- `response/` — ResponseModule: приём и хранение ответов респондентов
- `analytics/` — AnalyticsModule: NPS, распределение, heatmap, satisfaction matrix

**Frontend Structure (Next.js):**
```
apps/web/src/
├── app/
│   ├── (admin)/                # Route group: sidebar layout
│   │   ├── dashboard/page.tsx
│   │   ├── surveys/
│   │   │   ├── page.tsx        # Список опросов
│   │   │   └── [id]/
│   │   │       ├── builder/page.tsx    # Граф-конструктор
│   │   │       ├── analytics/page.tsx  # Аналитика
│   │   │       └── respondents/page.tsx
│   │   └── questions/page.tsx
│   ├── respond/[token]/page.tsx  # Публичный: респондент
│   └── login/page.tsx
├── components/
│   ├── ui/                     # shadcn/ui
│   ├── survey/                 # Граф-конструктор, ноды, рёбра
│   ├── analytics/              # Charts, heatmap, NPS gauge
│   └── respondent/             # Карточки прохождения
├── hooks/
├── stores/
├── lib/                        # API client, utils
└── types/
```

**Shared Package:**
```
packages/shared/src/
├── dto/                        # Shared DTO interfaces
├── enums/
│   ├── error-code.enum.ts
│   ├── survey-status.enum.ts
│   ├── question-type.enum.ts
│   └── respondent-status.enum.ts
├── types/                      # Shared type definitions
└── index.ts                    # Barrel export
```

**Tests:** Co-located — `{name}.spec.ts` рядом с `{name}.ts`

### Format Patterns

**API Response Format — Success:**
```json
{
  "data": { "id": 1, "title": "NPS Survey Q1", "status": "draft" },
  "meta": {}
}
```

**API Response Format — List with Pagination:**
```json
{
  "data": [...],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

**API Response Format — Error:**
```json
{
  "statusCode": 400,
  "message": "Survey is already active",
  "errorCode": "SURVEY_ALREADY_ACTIVE"
}
```

**Data Exchange Rules:**
- JSON fields: `camelCase` (TypeORM naming strategy трансформирует `snake_case` БД → `camelCase` API)
- Даты: ISO 8601 — `"2026-03-20T12:00:00.000Z"`
- Boolean: `true`/`false` (не 1/0)
- Null: явный `null` (не пустая строка, не undefined)
- IDs: числовые (auto-increment) для внутренних сущностей, UUID v4 для токенов респондентов

### Communication Patterns

**State Management (Frontend):**
- Server state: React Query — все данные с API через `useQuery` / `useMutation`
- Client state (граф): Zustand store — ноды, рёбра, выделение, UI state конструктора
- Синхронизация: при сохранении графа Zustand state → API mutation → React Query invalidation
- Immutable updates в Zustand (spread operator / produce)

**Zustand Store Convention:**
```typescript
// stores/surveyFlowStore.ts
interface SurveyFlowState {
  nodes: Node[];
  edges: Edge[];
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
}
```

### Process Patterns

**Error Handling (Backend):**
- Business exceptions: кастомные классы наследующие `HttpException` с `errorCode`
- Validation: глобальный `ValidationPipe` с `whitelist: true`, `forbidNonWhitelisted: true`
- Unexpected errors: глобальный `ExceptionFilter`, логирование, generic 500 response
- Запрещено: бросать строки, возвращать null вместо 404

**Error Handling (Frontend):**
- React Query `onError` → toast notification (shadcn/ui Toast)
- Формы: React Hook Form validation errors inline под полями
- Граф-конструктор: ValidationAlert компонент для ошибок валидации флоу
- Ответ API с errorCode → обработка через switch/map из shared enums

**Loading States (Frontend):**
- React Query `isPending` для серверных данных
- Skeleton компоненты для таблиц и карточек
- Кнопки при submit: `disabled` + текст меняется на "Сохранение..."
- Граф: канвас рендерится сразу, ноды подгружаются

### Enforcement Guidelines

**Все AI-агенты ОБЯЗАНЫ:**
1. Следовать strict layering: Controller → Service → Repository. Сервис НЕ содержит SQL/QueryBuilder
2. Использовать Mapper для Entity ↔ DTO трансформации. Маппинг НЕ в сервисе, НЕ в контроллере
3. Все DTO валидируются через class-validator декораторы. Все поля проверяются
4. Все API-ответы оборачиваются в `{ data, meta }`. Ошибки содержат `errorCode`
5. Error codes определяются в `packages/shared` и импортируются обоими apps
6. Файлы именуются `kebab-case` с суффиксом роли: `.service.ts`, `.controller.ts`, `.repository.ts`, `.mapper.ts`
7. Тесты co-located: `{name}.spec.ts` рядом с `{name}.ts`

**Anti-Patterns (запрещено):**
- SQL-запросы в сервисном слое
- Entity-маппинг в контроллере или сервисе
- Прямой возврат Entity из API (всегда через DTO + Mapper)
- Бизнес-логика в контроллере
- Хардкод error messages без errorCode
- Использование `any` type
- Мутация props в React-компонентах
- Конкретные реализации (классы, декораторы) в packages/shared

## Project Structure & Boundaries

### Complete Project Directory Structure

```
bmad-cem/
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml             # pnpm workspaces definition
├── turbo.json                      # Turborepo pipeline config
├── docker-compose.yml              # PostgreSQL service
├── .gitignore
├── .env.example                    # Template for environment variables
│
├── apps/
│   ├── web/                        # Next.js 16 Frontend
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── components.json         # shadcn/ui config
│   │   ├── .env.local
│   │   ├── .env.example
│   │   └── src/
│   │       ├── app/
│   │       │   ├── globals.css
│   │       │   ├── layout.tsx              # Root layout
│   │       │   ├── login/
│   │       │   │   └── page.tsx            # Login page
│   │       │   ├── (admin)/                # Route group: authenticated, sidebar layout
│   │       │   │   ├── layout.tsx          # Admin layout (sidebar + content)
│   │       │   │   ├── dashboard/
│   │       │   │   │   └── page.tsx        # Dashboard: список опросов, метрики
│   │       │   │   ├── surveys/
│   │       │   │   │   ├── page.tsx        # Список опросов
│   │       │   │   │   └── [id]/
│   │       │   │   │       ├── builder/
│   │       │   │   │       │   └── page.tsx    # Граф-конструктор (React Flow)
│   │       │   │   │       ├── analytics/
│   │       │   │   │       │   └── page.tsx    # Аналитика опроса
│   │       │   │   │       └── respondents/
│   │       │   │   │           └── page.tsx    # Список респондентов опроса
│   │       │   │   └── questions/
│   │       │   │       └── page.tsx        # Библиотека вопросов
│   │       │   └── respond/
│   │       │       └── [token]/
│   │       │           └── page.tsx        # Публичный: прохождение опроса
│   │       ├── components/
│   │       │   ├── ui/                     # shadcn/ui компоненты
│   │       │   │   ├── button.tsx
│   │       │   │   ├── card.tsx
│   │       │   │   ├── badge.tsx
│   │       │   │   ├── table.tsx
│   │       │   │   ├── input.tsx
│   │       │   │   ├── select.tsx
│   │       │   │   ├── textarea.tsx
│   │       │   │   ├── dialog.tsx
│   │       │   │   ├── sheet.tsx
│   │       │   │   ├── tabs.tsx
│   │       │   │   ├── pagination.tsx
│   │       │   │   ├── radio-group.tsx
│   │       │   │   ├── checkbox.tsx
│   │       │   │   ├── slider.tsx
│   │       │   │   ├── progress.tsx
│   │       │   │   ├── tooltip.tsx
│   │       │   │   ├── dropdown-menu.tsx
│   │       │   │   ├── alert.tsx
│   │       │   │   ├── skeleton.tsx
│   │       │   │   └── toast.tsx
│   │       │   ├── layout/
│   │       │   │   ├── Sidebar.tsx
│   │       │   │   ├── Breadcrumb.tsx
│   │       │   │   └── EmptyState.tsx
│   │       │   ├── survey/                  # Domain: граф-конструктор
│   │       │   │   ├── SurveyNode.tsx
│   │       │   │   ├── WelcomeNode.tsx
│   │       │   │   ├── ThankYouNode.tsx
│   │       │   │   ├── HeatmapEdge.tsx
│   │       │   │   ├── FlowCanvas.tsx
│   │       │   │   ├── FlowToolbar.tsx
│   │       │   │   ├── NodeSettingsPanel.tsx
│   │       │   │   ├── ValidationAlert.tsx
│   │       │   │   └── SurveyCard.tsx
│   │       │   ├── analytics/               # Domain: аналитика
│   │       │   │   ├── NpsGauge.tsx
│   │       │   │   ├── AnswerDistribution.tsx
│   │       │   │   ├── SatisfactionMatrix.tsx
│   │       │   │   ├── MetricCards.tsx
│   │       │   │   └── HeatmapView.tsx
│   │       │   ├── respondent/              # Domain: интерфейс респондента
│   │       │   │   ├── RespondentCard.tsx
│   │       │   │   ├── NpsInput.tsx
│   │       │   │   ├── WelcomeScreen.tsx
│   │       │   │   └── ThankYouScreen.tsx
│   │       │   └── question/                # Domain: библиотека вопросов
│   │       │       ├── QuestionForm.tsx
│   │       │       └── QuestionFilters.tsx
│   │       ├── hooks/
│   │       │   ├── useAuth.ts
│   │       │   ├── useSurveys.ts
│   │       │   ├── useQuestions.ts
│   │       │   ├── useRespondents.ts
│   │       │   ├── useAnalytics.ts
│   │       │   └── useRespondentFlow.ts
│   │       ├── stores/
│   │       │   └── surveyFlowStore.ts       # Zustand: state граф-конструктора
│   │       ├── lib/
│   │       │   ├── apiClient.ts             # Axios/fetch wrapper с JWT
│   │       │   ├── queryClient.ts           # React Query client config
│   │       │   └── utils.ts
│   │       └── types/
│   │           └── index.ts                 # Frontend-only types
│   │
│   └── api/                        # NestJS 11 Backend
│       ├── package.json
│       ├── nest-cli.json
│       ├── tsconfig.json
│       ├── tsconfig.build.json
│       ├── .env
│       ├── .env.example
│       └── src/
│           ├── main.ts                      # Bootstrap, global pipes/filters
│           ├── app.module.ts                # Root module
│           ├── config/
│           │   └── database.config.ts       # TypeORM config from env
│           ├── common/
│           │   ├── decorators/
│           │   │   └── public.decorator.ts
│           │   ├── filters/
│           │   │   └── http-exception.filter.ts
│           │   ├── guards/
│           │   │   └── jwt-auth.guard.ts
│           │   ├── interceptors/
│           │   │   └── response-wrapper.interceptor.ts  # { data, meta } wrapper
│           │   └── pipes/
│           │       └── validation.pipe.ts
│           └── modules/
│               ├── auth/
│               │   ├── auth.module.ts
│               │   ├── auth.controller.ts
│               │   ├── auth.service.ts
│               │   ├── auth.service.spec.ts
│               │   ├── strategies/
│               │   │   └── jwt.strategy.ts
│               │   └── dto/
│               │       └── login.dto.ts
│               ├── question/
│               │   ├── question.module.ts
│               │   ├── question.controller.ts
│               │   ├── question.service.ts
│               │   ├── question.service.spec.ts
│               │   ├── question.repository.ts
│               │   ├── question.repository.spec.ts
│               │   ├── question.mapper.ts
│               │   ├── dto/
│               │   │   ├── create-question.dto.ts
│               │   │   ├── update-question.dto.ts
│               │   │   └── question-response.dto.ts
│               │   └── entities/
│               │       └── question.entity.ts
│               ├── survey/
│               │   ├── survey.module.ts
│               │   ├── survey.controller.ts
│               │   ├── survey.service.ts
│               │   ├── survey.service.spec.ts
│               │   ├── survey.repository.ts
│               │   ├── survey.repository.spec.ts
│               │   ├── survey.mapper.ts
│               │   ├── dto/
│               │   │   ├── create-survey.dto.ts
│               │   │   ├── update-survey.dto.ts
│               │   │   ├── update-survey-flow.dto.ts
│               │   │   └── survey-response.dto.ts
│               │   └── entities/
│               │       └── survey.entity.ts
│               ├── respondent/
│               │   ├── respondent.module.ts
│               │   ├── respondent.controller.ts
│               │   ├── respondent-public.controller.ts  # @Public()
│               │   ├── respondent.service.ts
│               │   ├── respondent.service.spec.ts
│               │   ├── respondent.repository.ts
│               │   ├── respondent.mapper.ts
│               │   ├── dto/
│               │   │   ├── add-respondent.dto.ts
│               │   │   ├── submit-answer.dto.ts
│               │   │   └── respondent-response.dto.ts
│               │   └── entities/
│               │       ├── respondent.entity.ts
│               │       └── response.entity.ts
│               └── analytics/
│                   ├── analytics.module.ts
│                   ├── analytics.controller.ts
│                   ├── analytics.service.ts
│                   ├── analytics.service.spec.ts
│                   ├── analytics.repository.ts
│                   └── dto/
│                       ├── analytics-response.dto.ts
│                       └── heatmap-response.dto.ts
│
├── packages/
│   ├── shared/                     # Shared contracts — ТОЛЬКО ИНТЕРФЕЙСЫ
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts            # Barrel export
│   │       ├── dto/                # ТОЛЬКО TypeScript interfaces (не классы)
│   │       │   ├── survey.dto.ts           # ICreateSurveyDto, IUpdateSurveyDto, ISurveyResponseDto
│   │       │   ├── question.dto.ts         # ICreateQuestionDto, IQuestionResponseDto
│   │       │   ├── respondent.dto.ts       # IAddRespondentDto, ISubmitAnswerDto
│   │       │   ├── analytics.dto.ts        # IAnalyticsResponseDto, IHeatmapResponseDto
│   │       │   └── pagination.dto.ts       # IPaginationMeta, IPaginatedResponse<T>
│   │       ├── enums/
│   │       │   ├── error-code.enum.ts
│   │       │   ├── survey-status.enum.ts
│   │       │   ├── question-type.enum.ts
│   │       │   └── respondent-status.enum.ts
│   │       ├── types/
│   │       │   ├── api-response.type.ts    # IApiResponse<T>, IApiError
│   │       │   └── survey-flow.type.ts     # ISurveyFlow, IFlowNode, IFlowEdge
│   │       └── validation/
│   │           └── flow-validator.ts       # Алгоритм валидации графа (pure functions)
│   │
│   └── config/                     # Shared configs
│       ├── package.json
│       ├── eslint/
│       │   └── index.js
│       └── typescript/
│           ├── base.json
│           ├── nextjs.json
│           └── nestjs.json
```

### Shared Package Contract: Interfaces Only

**Принцип:** `packages/shared` содержит ИСКЛЮЧИТЕЛЬНО интерфейсы, enums, типы и pure functions. Никаких конкретных реализаций, классов или зависимостей от фреймворков.

**Паттерн использования:**

```typescript
// packages/shared/src/dto/survey.dto.ts — ТОЛЬКО интерфейс
export interface ICreateSurveyDto {
  title: string;
  description?: string;
}

// apps/api/src/modules/survey/dto/create-survey.dto.ts — РЕАЛИЗАЦИЯ + декораторы
import { ICreateSurveyDto } from '@bmad-cem/shared';
import { IsString, IsOptional } from 'class-validator';

export class CreateSurveyDto implements ICreateSurveyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

// apps/web — ИСПОЛЬЗОВАНИЕ интерфейса напрямую
import { ICreateSurveyDto } from '@bmad-cem/shared';
const payload: ICreateSurveyDto = { title: 'NPS Q1' };
```

**Правила для packages/shared:**
- Только `interface`, `type`, `enum` и pure functions (без side effects)
- Никаких зависимостей от NestJS, class-validator, TypeORM
- Никаких классов с декораторами
- Backend реализует интерфейсы в своих DTO-классах с class-validator декораторами
- Frontend импортирует и использует интерфейсы напрямую для типизации
- Именование интерфейсов: префикс `I` — `ICreateSurveyDto`, `ISurveyResponseDto`

### Architectural Boundaries

**API Boundaries:**

| Boundary | Auth | Route prefix | Описание |
|---|---|---|---|
| Admin API | JWT (JwtAuthGuard) | `/api/v1/` | Все CRUD операции, аналитика |
| Public API | None (@Public) | `/api/v1/respond/` | Получение опроса, отправка ответов |
| Swagger | None | `/api/docs` | Документация API (dev only) |

**Component Boundaries (Frontend):**

| Boundary | Route group | Layout | Auth |
|---|---|---|---|
| Admin UI | `(admin)/*` | Sidebar + Content | JWT required, redirect to /login |
| Respondent UI | `respond/[token]` | Centered card | No auth, UUID token only |
| Login | `login` | Minimal | No auth |

**Data Boundaries:**

| Entity | Владелец (module) | Читает (modules) |
|---|---|---|
| Question | QuestionModule | SurveyModule |
| Survey (+ flow JSONB) | SurveyModule | AnalyticsModule, RespondentModule |
| Respondent | RespondentModule | AnalyticsModule |
| Response (ответы) | RespondentModule | AnalyticsModule |

### Requirements to Structure Mapping

| FR категория | Backend module | Frontend pages | Frontend components | Shared |
|---|---|---|---|---|
| FR1-FR6 Библиотека вопросов | `modules/question/` | `questions/page.tsx` | `components/question/` | `dto/question.dto.ts`, `enums/question-type.enum.ts` |
| FR7-FR13 Конструктор | `modules/survey/` | `surveys/[id]/builder/` | `components/survey/` | `types/survey-flow.type.ts` |
| FR14-FR17 Валидация флоу | `modules/survey/` | `components/survey/ValidationAlert.tsx` | `components/survey/` | `validation/flow-validator.ts` |
| FR18-FR23 Lifecycle | `modules/survey/` | — | — | `enums/survey-status.enum.ts` |
| FR24-FR29 Распространение | `modules/respondent/` | `surveys/[id]/respondents/` | — | `enums/respondent-status.enum.ts` |
| FR30-FR37 UX респондента | `modules/respondent/` (public) | `respond/[token]/` | `components/respondent/` | `dto/respondent.dto.ts` |
| FR38-FR43 Аналитика | `modules/analytics/` | `surveys/[id]/analytics/` | `components/analytics/` | `dto/analytics.dto.ts` |
| FR44-FR48 Auth & UI | `modules/auth/` | `login/`, `(admin)/layout.tsx` | `components/layout/` | — |

### Data Flow

```
[Респондент] → respond/[token] → Public API → RespondentModule → PostgreSQL
                                                                      ↓
[Админ] → (admin)/* → Admin API → SurveyModule/QuestionModule → PostgreSQL
                                        ↓
                                 AnalyticsModule → агрегация → API Response
                                        ↓
                        Frontend: React Query → Recharts / HeatmapView
```

### Development Workflow

- `docker compose up -d` → PostgreSQL на localhost:5432
- `turbo dev` → apps/web (localhost:3000) + apps/api (localhost:3001)
- Изменения в `packages/shared` → автоматический rebuild обоих apps через Turborepo

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** Все технологии совместимы. Next.js 16 + NestJS 11 + TypeORM 0.3.28 + @xyflow/react 12.10.1 + shadcn/cli v4 — конфликтов не обнаружено. Zustand + React Query работают параллельно без конфликтов.

**Pattern Consistency:** Naming conventions (snake_case DB → camelCase API → PascalCase classes) единообразны. Strict layering (Controller → Service → Repository + Mapper) применяется ко всем 6 backend-модулям. Shared interfaces pattern (interface в shared → class implements в backend → interface использует frontend) консистентен.

**Structure Alignment:** Monorepo структура (apps/web, apps/api, packages/shared, packages/config) полностью отражает архитектурные решения. Boundaries между admin и public UI разграничены через Next.js route groups и NestJS guards.

### Requirements Coverage ✅

**Функциональные требования:** 48/48 FR покрыты архитектурными решениями. Каждая FR-категория маппируется на конкретный backend-модуль, frontend-страницу и shared-контракт.

**Нефункциональные требования:** 8/10 NFR покрыты. NFR7 (rate limiting) и NFR10 (HTTPS) осознанно отложены на post-MVP.

### Implementation Readiness ✅

**Decision Completeness:** Все критические решения задокументированы с указанием конкретных версий (March 2026). Включены: стек, layering, state management, формы, charts, auth, API format, error handling.

**Structure Completeness:** Полное дерево проекта с каждым файлом и директорией. 6 backend-модулей, 6 frontend route-групп, shared пакет с интерфейсами.

**Pattern Completeness:** Определены naming, structure, format, communication и process patterns. Enforcement guidelines с 7 обязательными правилами и списком anti-patterns.

### Gaps Identified & Resolved

**Seed Data:** Дефолтный пользователь (admin/123) — добавить seed script в `apps/api/src/config/seed.ts`, запускается при synchronize: true.

**CORS:** Frontend (localhost:3000) → Backend (localhost:3001) — NestJS `app.enableCors()` с whitelist origin в ConfigModule.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low-Medium)
- [x] Technical constraints identified (solo-developer, Turborepo)
- [x] Cross-cutting concerns mapped (4 concerns)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified (8 packages with versions)
- [x] Integration patterns defined (shared interfaces, API boundaries)
- [x] Performance considerations addressed (NFR1-NFR5)

**✅ Implementation Patterns**
- [x] Naming conventions established (DB, API, code backend, code frontend)
- [x] Structure patterns defined (module template, frontend structure)
- [x] Communication patterns specified (React Query + Zustand sync)
- [x] Process patterns documented (error handling, loading states)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established (admin/public/shared)
- [x] Integration points mapped (data flow diagram)
- [x] Requirements to structure mapping complete (48 FR → modules)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Чёткое разделение слоёв (Controller → Service → Repository + Mapper) предотвращает утечку абстракций
- Shared interfaces без реализаций — чистый контракт между frontend и backend
- Полный маппинг 48 FR на конкретные модули и файлы
- Enforcement guidelines с anti-patterns дают AI-агентам ясные границы

**Areas for Future Enhancement:**
- Миграции БД (переход с synchronize на TypeORM migrations при стабилизации схемы)
- Rate limiting и security hardening
- CI/CD pipeline
- Production deployment strategy
- Monitoring и logging (расширение за NestJS Logger)

### Implementation Handoff

**AI Agent Guidelines:**
- Следовать strict layering: Controller → Service → Repository
- Использовать Mapper для Entity ↔ DTO
- packages/shared — ТОЛЬКО интерфейсы, enums, types, pure functions
- Backend implements интерфейсы из shared с class-validator декораторами
- Все API-ответы в формате `{ data, meta }`
- Error codes из shared enum
- Тесты co-located
- Файлы kebab-case с суффиксом роли

**First Implementation Priority:**
1. Monorepo setup: `npx create-turbo@latest`, `create-next-app`, `nest new`
2. Docker Compose + PostgreSQL
3. packages/shared: interfaces, enums, types
4. apps/api: NestJS bootstrap с global pipes/filters/guards
5. apps/web: Next.js с shadcn/ui init
