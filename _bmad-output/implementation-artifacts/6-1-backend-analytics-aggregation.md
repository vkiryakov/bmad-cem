# Story 6.1: Backend — агрегация аналитики

Status: ready-for-dev

## Story

As a пользователь,
I want API с агрегированной аналитикой по каждому опросу,
So that frontend может отображать метрики, графики и heatmap.

## Acceptance Criteria

1. **Given** AnalyticsModule создан (repository, service, controller)
   **When** GET /api/v1/surveys/:id/analytics/summary
   **Then** возвращается: totalRespondents, completedRespondents, completionRate, averageNps
   **And** npsBreakdown: {detractors: count, passives: count, promoters: count, detractorPercent, passivePercent, promoterPercent} (FR38)

2. **Given** опрос с ответами
   **When** GET /api/v1/surveys/:id/analytics/distribution
   **Then** возвращается распределение ответов по каждому вопросу
   **And** для NPS: количество по каждой оценке 0-10
   **And** для закрытого/мульти-селект: количество по каждому варианту
   **And** для открытого: список текстовых ответов (FR39)

3. **Given** опрос с ответами
   **When** GET /api/v1/surveys/:id/analytics/heatmap
   **Then** возвращается для каждой ноды: nodeId, respondentCount
   **And** для каждого ребра: edgeId, traversalCount, dropOffCount
   **And** данные достаточны для визуализации толщины/цвета рёбер (FR41)

4. **Given** опрос с ответами
   **When** GET /api/v1/surveys/:id/analytics/satisfaction
   **Then** возвращается satisfaction matrix: категории вопросов x средний балл/распределение (FR40)

5. **Given** эндпоинты аналитики
   **When** запрос с query params ?dateFrom=...&dateTo=...&respondentId=...
   **Then** данные фильтруются по указанным параметрам (FR42)

6. **Given** конкретный респондент
   **When** GET /api/v1/surveys/:id/analytics/respondents/:respondentId/path
   **Then** возвращается полный путь: последовательность вопросов + ответы + timestamps (FR43)

7. **Given** опрос с до 500 ответами
   **When** запрашивается любой эндпоинт аналитики
   **Then** ответ возвращается за < 3 секунды (NFR3)

8. **Given** опрос без ответов
   **When** запрашивается аналитика
   **Then** возвращаются нулевые значения (не ошибка)

## Tasks / Subtasks

### Модуль и структура файлов
- [ ] Создать `apps/api/src/modules/analytics/analytics.module.ts` с импортом зависимостей (TypeORM entities: Response, Respondent, Survey, Question) [AC 1-8]
- [ ] Создать `apps/api/src/modules/analytics/analytics.controller.ts` с эндпоинтами [AC 1-6]
- [ ] Создать `apps/api/src/modules/analytics/analytics.service.ts` с бизнес-логикой агрегации [AC 1-6]
- [ ] Создать `apps/api/src/modules/analytics/analytics.repository.ts` с SQL-агрегациями [AC 1-6]

### DTO
- [ ] Создать `apps/api/src/modules/analytics/dto/analytics-response.dto.ts` — SummaryResponseDto (totalRespondents, completedRespondents, completionRate, averageNps, npsBreakdown) [AC 1]
- [ ] Создать `apps/api/src/modules/analytics/dto/analytics-response.dto.ts` — DistributionResponseDto (массив по вопросам: questionId, questionType, questionText, distribution) [AC 2]
- [ ] Создать `apps/api/src/modules/analytics/dto/heatmap-response.dto.ts` — HeatmapResponseDto (nodes: [{nodeId, respondentCount}], edges: [{edgeId, traversalCount, dropOffCount}]) [AC 3]
- [ ] Создать SatisfactionResponseDto — матрица категория x метрика [AC 4]
- [ ] Создать RespondentPathResponseDto — массив шагов [{questionId, questionText, answer, answeredAt}] [AC 6]
- [ ] Создать AnalyticsFilterDto — dateFrom?: string (ISO), dateTo?: string (ISO), respondentId?: number с class-validator декораторами [AC 5]

### Эндпоинты контроллера
- [ ] `GET /api/v1/surveys/:id/analytics/summary` — принимает AnalyticsFilterDto как query, вызывает service.getSummary(surveyId, filters), оборачивается в {data, meta} [AC 1]
- [ ] `GET /api/v1/surveys/:id/analytics/distribution` — аналогично, вызывает service.getDistribution(surveyId, filters) [AC 2]
- [ ] `GET /api/v1/surveys/:id/analytics/heatmap` — вызывает service.getHeatmap(surveyId, filters) [AC 3]
- [ ] `GET /api/v1/surveys/:id/analytics/satisfaction` — вызывает service.getSatisfaction(surveyId, filters) [AC 4]
- [ ] `GET /api/v1/surveys/:id/analytics/respondents/:respondentId/path` — вызывает service.getRespondentPath(surveyId, respondentId) [AC 6]
- [ ] Все эндпоинты защищены JwtAuthGuard (глобальный) [AC 1-6]
- [ ] Swagger-декораторы (@ApiTags, @ApiOperation, @ApiResponse) на каждом эндпоинте [AC 1-6]

### Repository — SQL-агрегации
- [ ] `getSummary()` — COUNT respondents, COUNT completed, вычисление completion rate; для NPS: GROUP BY оценке, расчёт detractors (0-6), passives (7-8), promoters (9-10), averageNps = (promoterPercent - detractorPercent) [AC 1]
- [ ] `getDistribution()` — для каждого вопроса из flow: GROUP BY ответу, подсчёт количества. Для open-вопросов — SELECT текстовые ответы [AC 2]
- [ ] `getHeatmap()` — подсчёт respondentCount по nodeId (через ответы привязанные к вопросам/нодам), подсчёт traversalCount по edgeId (последовательные пары ответов определяют ребро), dropOffCount = respondentCount(sourceNode) - traversalCount(edge) [AC 3]
- [ ] `getSatisfaction()` — GROUP BY категории вопроса, AVG балла для NPS и числовых вопросов, распределение для закрытых [AC 4]
- [ ] `getRespondentPath()` — SELECT ответы респондента ORDER BY answeredAt, JOIN с вопросами для текстов [AC 6]
- [ ] Все методы repository принимают фильтры (dateFrom, dateTo, respondentId) и применяют WHERE условия [AC 5]

### Service — бизнес-логика
- [ ] `getSummary()` — вызвать repository, рассчитать производные метрики (completionRate, npsBreakdown percentages), вернуть через mapper [AC 1]
- [ ] `getDistribution()` — вызвать repository, группировать по типу вопроса, для NPS — массив 0-10 с counts [AC 2]
- [ ] `getHeatmap()` — вызвать repository, маппинг nodeId/edgeId из flow JSONB к данным ответов [AC 3]
- [ ] `getSatisfaction()` — вызвать repository, сформировать матрицу [AC 4]
- [ ] `getRespondentPath()` — вызвать repository, сформировать timeline [AC 6]
- [ ] Проверка существования survey (404 SURVEY_NOT_FOUND), проверка существования respondent (404 RESPONDENT_NOT_FOUND) [AC 6]
- [ ] Обработка случая без ответов — возврат нулевых значений [AC 8]

### Фильтрация
- [ ] dateFrom/dateTo фильтрация по полю answeredAt в таблице responses (WHERE answeredAt >= dateFrom AND answeredAt <= dateTo) [AC 5]
- [ ] respondentId фильтрация — WHERE respondentId = :respondentId [AC 5]
- [ ] Валидация дат через class-validator @IsOptional() @IsDateString() [AC 5]

### Производительность
- [ ] Убедиться, что SQL-запросы используют индексы: idx_responses_survey_id, idx_responses_respondent_id, idx_responses_answered_at [AC 7]
- [ ] Проверить время выполнения на данных с 500 ответами — все эндпоинты < 3 секунд [AC 7]

### Тесты
- [ ] `analytics.service.spec.ts` — unit-тесты для каждого метода сервиса (mock repository) [AC 1-8]
- [ ] `analytics.repository.spec.ts` — integration-тесты для SQL-агрегаций [AC 1-6]

## Dev Notes

### Критические технические требования
- NestJS 11.1.17, TypeORM 0.3.28, PostgreSQL
- Все DTO реализуют интерфейсы из `@bmad-cem/shared` (IAnalyticsResponseDto, IHeatmapResponseDto)
- class-validator + class-transformer для валидации query params
- @nestjs/swagger декораторы для авто-документации

### Архитектурные решения
- **Strict layering:** Controller -> Service -> Repository. SQL/QueryBuilder ТОЛЬКО в repository
- **Mapper:** Для entity -> DTO трансформации использовать отдельный mapper (можно inline в этом модуле, т.к. analytics не имеет своей entity)
- **Heatmap-данные:** Агрегация строится на основе ответов (responses table) + flow JSONB из survey. Для определения edgeId: пара (текущий questionId, следующий questionId) = ребро. Flow JSONB содержит маппинг nodeId -> questionId и edgeId -> source/target
- **NPS формула:** NPS = % promoters (9-10) - % detractors (0-6). Диапазон: -100..+100
- **Drop-off расчёт:** Для каждого ребра: dropOffCount = respondentCount(sourceNode) - traversalCount(edge). Респонденты, начавшие но не перешедшие по ребру
- **Нулевые данные:** Если опрос существует, но ответов нет — возвращать структуру с нулями (totalRespondents: 0, completionRate: 0, averageNps: null, пустые массивы). Не 404

### ЗАПРЕТЫ (anti-patterns)
- НЕ выполнять SQL-запросы в сервисном слое — только через repository
- НЕ возвращать Entity напрямую из API — только через DTO
- НЕ использовать `any` type
- НЕ хардкодить error messages без errorCode из shared enum
- НЕ реализовывать кэширование (отложено на post-MVP)
- НЕ создавать отдельные Entity для аналитики — данные агрегируются из существующих (Response, Respondent, Survey)
- НЕ делать фронтенд-компоненты в этой story — только backend API

### Previous Story Context
- **Epic 1 (Story 1.1-1.5):** Monorepo, shared пакет, NestJS bootstrap (глобальные pipes/filters/guards, JWT auth, response wrapper), Next.js shell
- **Epic 2 (Story 2.1):** QuestionModule — Question entity, CRUD API
- **Epic 3 (Story 3.1):** SurveyModule — Survey entity с flow JSONB, CRUD + flow save/load
- **Epic 4 (Story 4.1-4.2):** Lifecycle (activate/complete/archive), RespondentModule — Respondent entity, Response entity, UUID tokens, status tracking
- **Epic 5 (Story 5.1):** Public API прохождения — POST /respond/:token/answer сохраняет ответы в Response entity

### Project Structure Notes
```
apps/api/src/modules/analytics/
├── analytics.module.ts
├── analytics.controller.ts
├── analytics.service.ts
├── analytics.service.spec.ts
├── analytics.repository.ts
├── analytics.repository.spec.ts
└── dto/
    ├── analytics-response.dto.ts    # Summary, Distribution, Satisfaction, RespondentPath DTOs
    └── heatmap-response.dto.ts      # Heatmap DTO (nodes + edges)
```

Зависимости модуля (импорт):
- TypeORM entities: Survey (из survey module), Respondent, Response (из respondent module), Question (из question module)
- Shared: IAnalyticsResponseDto, IHeatmapResponseDto, ErrorCode enum

### References
- **FR38:** Общий дашборд (количество ответов, completion rate, средний NPS)
- **FR39:** Распределение ответов по каждому вопросу (гистограмма, pie chart)
- **FR40:** Satisfaction matrix
- **FR41:** Heatmap путей прохождения на графе React Flow
- **FR42:** Фильтрация аналитики по дате, респонденту, ветке флоу
- **FR43:** Полный путь и ответы конкретного респондента
- **NFR3:** Аналитика рассчитывается за < 3 секунды для опросов с до 500 ответами
- **Architecture:** apps/api/src/modules/analytics/ (AR4 strict layering, AR7 response wrapper, AR10 Swagger)

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
