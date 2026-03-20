# Story 3.1: Backend — CRUD опросов и хранение flow (JSONB)

Status: ready-for-dev

## Story

As a пользователь,
I want API для создания опросов и хранения графа,
So that мои опросы и их структура сохраняются на сервере.

## Acceptance Criteria

1. **Создание опроса**
   - Given SurveyModule создан (entity, repository, mapper, service, controller)
   - When POST /api/v1/surveys с {title: "NPS Q1 2026"}
   - Then опрос создаётся со статусом draft и пустым flow (JSONB)
   - And возвращается {data: ISurveyResponseDto, meta: {}} (FR7)

2. **Сохранение flow как JSONB**
   - Given опрос существует
   - When PUT /api/v1/surveys/:id/flow с {nodes: [...], edges: [...]}
   - Then flow сохраняется как JSONB в колонку flow таблицы surveys
   - And данные соответствуют типам ISurveyFlow, IFlowNode, IFlowEdge из shared

3. **Получение опроса с flow**
   - Given опрос существует
   - When GET /api/v1/surveys/:id
   - Then возвращается опрос с полным flow (nodes + edges)

4. **Список опросов с пагинацией (без flow)**
   - Given существуют опросы
   - When GET /api/v1/surveys?page=1&limit=10
   - Then возвращается список опросов с пагинацией (без flow, только метаданные)

5. **Обновление метаданных опроса**
   - Given опрос существует
   - When PUT /api/v1/surveys/:id с {title: "Новое название"}
   - Then метаданные опроса обновляются

6. **404 для несуществующего опроса**
   - Given несуществующий опрос
   - When GET/PUT /api/v1/surveys/:id
   - Then возвращается 404 с errorCode SURVEY_NOT_FOUND

## Tasks / Subtasks

- [ ] Task 1: Survey Entity (AC: #1, #2)
  - [ ] 1.1 Создать `apps/api/src/modules/survey/entities/survey.entity.ts`
  - [ ] 1.2 Поля: id (PK, auto-increment), title (varchar), description (varchar, nullable), status (enum, default: 'draft'), flow (jsonb, default: {nodes: [], edges: []}), createdAt, updatedAt
  - [ ] 1.3 Колонка `flow` — тип `jsonb`, хранит ISurveyFlow из shared
  - [ ] 1.4 Добавить индекс на status: `idx_surveys_status`

- [ ] Task 2: DTO — создание и обновление (AC: #1, #2, #5)
  - [ ] 2.1 Создать `dto/create-survey.dto.ts` — implements ICreateSurveyDto из shared, декораторы class-validator (@IsString, @IsOptional)
  - [ ] 2.2 Создать `dto/update-survey.dto.ts` — PartialType(CreateSurveyDto)
  - [ ] 2.3 Создать `dto/update-survey-flow.dto.ts` — поля nodes (IFlowNode[]) и edges (IFlowEdge[]), @IsArray, @ValidateNested
  - [ ] 2.4 Создать `dto/survey-response.dto.ts` — формат ответа API

- [ ] Task 3: Survey Repository (AC: #1, #2, #3, #4)
  - [ ] 3.1 Создать `survey.repository.ts` — custom repository через TypeORM DataSource
  - [ ] 3.2 Метод `createSurvey(data)` — создание с default status: draft и пустым flow
  - [ ] 3.3 Метод `findById(id)` — полный опрос с flow
  - [ ] 3.4 Метод `findAll(page, limit, search?)` — список без flow (select конкретных полей), с пагинацией
  - [ ] 3.5 Метод `updateMetadata(id, data)` — обновление title/description
  - [ ] 3.6 Метод `updateFlow(id, flow)` — обновление JSONB-колонки flow
  - [ ] 3.7 Написать `survey.repository.spec.ts`

- [ ] Task 4: Survey Mapper (AC: #1, #3, #4)
  - [ ] 4.1 Создать `survey.mapper.ts` — toResponseDto(entity), toListItemDto(entity)
  - [ ] 4.2 toResponseDto — включает flow
  - [ ] 4.3 toListItemDto — без flow, только метаданные (id, title, status, createdAt, updatedAt)

- [ ] Task 5: Survey Service (AC: #1-#6)
  - [ ] 5.1 Создать `survey.service.ts` — inject repository + mapper
  - [ ] 5.2 Метод `create(dto)` — создаёт опрос, возвращает DTO
  - [ ] 5.3 Метод `findById(id)` — возвращает DTO или бросает NotFoundException с errorCode SURVEY_NOT_FOUND
  - [ ] 5.4 Метод `findAll(page, limit, search?)` — возвращает paginated DTO
  - [ ] 5.5 Метод `updateMetadata(id, dto)` — обновляет, проверяет существование
  - [ ] 5.6 Метод `updateFlow(id, flowDto)` — сохраняет flow JSONB
  - [ ] 5.7 Написать `survey.service.spec.ts`

- [ ] Task 6: Survey Controller (AC: #1-#6)
  - [ ] 6.1 Создать `survey.controller.ts` — @Controller('api/v1/surveys')
  - [ ] 6.2 POST / — создание опроса
  - [ ] 6.3 GET / — список с пагинацией (?page, ?limit, ?search)
  - [ ] 6.4 GET /:id — получение с flow
  - [ ] 6.5 PUT /:id — обновление метаданных
  - [ ] 6.6 PUT /:id/flow — обновление flow
  - [ ] 6.7 Swagger-декораторы на все эндпоинты (@ApiTags, @ApiOperation, @ApiResponse)

- [ ] Task 7: Survey Module (AC: #1)
  - [ ] 7.1 Создать `survey.module.ts` — imports: TypeOrmModule.forFeature([Survey])
  - [ ] 7.2 Зарегистрировать providers: SurveyService, SurveyRepository, SurveyMapper
  - [ ] 7.3 Подключить модуль в AppModule

- [ ] Task 8: Shared типы для flow (AC: #2)
  - [ ] 8.1 Проверить наличие ISurveyFlow, IFlowNode, IFlowEdge в `packages/shared/src/types/survey-flow.type.ts`
  - [ ] 8.2 Если отсутствуют — создать/дополнить: ISurveyFlow {nodes: IFlowNode[], edges: IFlowEdge[]}, IFlowNode {id, type, position, data}, IFlowEdge {id, source, sourceHandle, target, targetHandle}
  - [ ] 8.3 Проверить наличие ErrorCode SURVEY_NOT_FOUND в `packages/shared/src/enums/error-code.enum.ts`

## Dev Notes

### Критические технические требования
- **NestJS 11.1.17**, **TypeORM 0.3.28**, **PostgreSQL 17**
- TypeORM synchronize: true (AR14) — без миграций на MVP
- JSONB-колонка: TypeORM тип `jsonb`, не `json` (поддержка индексации и операторов PostgreSQL)
- Naming strategy: camelCase в коде → snake_case в БД (настроен глобально в database.config.ts)

### Архитектурные решения
- **Strict layering:** Controller → Service → Repository + Mapper (AR4)
- **Mapper отдельно:** Entity ↔ DTO маппинг ТОЛЬКО через SurveyMapper, не в сервисе и не в контроллере
- **Flow в surveys:** JSONB-колонка в таблице surveys, НЕ отдельная таблица (AR14 — граф всегда загружается с опросом)
- **Response wrapper:** Все ответы оборачиваются глобальным ResponseWrapper interceptor в {data, meta} (AR7)
- **Пагинация:** meta содержит {page, limit, total, totalPages} — формат из IPaginatedResponse<T> в shared
- **ErrorCode из shared:** SURVEY_NOT_FOUND — enum в packages/shared, импортируется и backend, и frontend
- **API versioning:** Все эндпоинты под /api/v1/ (AR5)

### ЗАПРЕТЫ (anti-patterns)
- НЕ возвращать Entity напрямую из API — всегда через DTO + Mapper
- НЕ писать SQL/QueryBuilder в сервисе — только в repository
- НЕ хранить flow в отдельной таблице — только JSONB в surveys
- НЕ включать flow в ответ списка опросов (GET /api/v1/surveys) — только метаданные
- НЕ использовать `any` type
- НЕ хардкодить error messages без errorCode
- НЕ реализовывать lifecycle transitions (activate/complete/archive) — это Epic 4

### Previous Story Context
- **Story 1.1:** Monorepo создан (Turborepo + pnpm), apps/web, apps/api, packages/shared, Docker Compose + PostgreSQL
- **Story 1.2:** Shared пакет: enums (ErrorCode, SurveyStatus, QuestionType), интерфейсы DTO (ICreateSurveyDto, ISurveyResponseDto), типы (ISurveyFlow, IFlowNode, IFlowEdge), flow-validator.ts
- **Story 1.3:** NestJS bootstrap: ConfigModule, TypeORM, глобальный ValidationPipe, ExceptionFilter, ResponseWrapper interceptor, Swagger, CORS, health endpoint
- **Story 1.4:** AuthModule: JWT, JwtAuthGuard глобальный, @Public() декоратор, seed admin user
- **Story 2.1:** QuestionModule: CRUD вопросов — аналогичная структура (entity, repository, mapper, service, controller)

### Project Structure Notes
```
apps/api/src/modules/survey/
├── survey.module.ts
├── survey.controller.ts
├── survey.service.ts
├── survey.service.spec.ts
├── survey.repository.ts
├── survey.repository.spec.ts
├── survey.mapper.ts
├── dto/
│   ├── create-survey.dto.ts
│   ├── update-survey.dto.ts
│   ├── update-survey-flow.dto.ts
│   └── survey-response.dto.ts
└── entities/
    └── survey.entity.ts

packages/shared/src/
├── types/survey-flow.type.ts      # ISurveyFlow, IFlowNode, IFlowEdge
├── dto/survey.dto.ts              # ICreateSurveyDto, ISurveyResponseDto
└── enums/
    ├── error-code.enum.ts         # SURVEY_NOT_FOUND
    └── survey-status.enum.ts      # draft, active, completed, archived
```

### References
- Architecture: AR4 (strict layering), AR5 (versioning), AR7 (response wrapper), AR13 (flow JSONB), AR14 (synchronize: true)
- PRD: FR7 (создание опроса)
- Epics: Story 3.1

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
