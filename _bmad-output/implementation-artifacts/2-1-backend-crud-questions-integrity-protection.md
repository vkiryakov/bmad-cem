# Story 2.1: Backend — CRUD вопросов и защита целостности

Status: ready-for-dev

## Story

As a пользователь,
I want API для управления вопросами с защитой от изменения вопросов с ответами,
So that я могу создавать и поддерживать библиотеку вопросов без риска потери данных.

## Acceptance Criteria

1. **Given** QuestionModule создан (entity, repository, mapper, service, controller)
   **When** POST /api/v1/questions с {text: "Оцените от 0 до 10", type: "nps"}
   **Then** вопрос создаётся в БД и возвращается в формате {data: IQuestionResponseDto, meta: {}}
   **And** поддерживаются 5 типов: nps, open, closed, matrix, multi_select (FR1)

2. **Given** вопрос типа closed создаётся
   **When** POST /api/v1/questions с {text: "...", type: "closed", options: ["Да", "Нет", "Не знаю"]}
   **Then** варианты ответов сохраняются вместе с вопросом
   **And** для типов matrix и multi_select варианты также обязательны

3. **Given** существуют вопросы в БД
   **When** GET /api/v1/questions?page=1&limit=10
   **Then** возвращается список с пагинацией {data: [...], meta: {page, limit, total, totalPages}} (FR2)

4. **Given** существуют вопросы разных типов
   **When** GET /api/v1/questions?questionType=nps
   **Then** возвращаются только вопросы указанного типа (FR2)

5. **Given** существуют вопросы
   **When** GET /api/v1/questions?search=удовлетворённость
   **Then** возвращаются вопросы, содержащие искомый текст (FR6)

6. **Given** вопрос без ответов
   **When** PUT /api/v1/questions/:id с обновлёнными данными
   **Then** вопрос обновляется (FR3)

7. **Given** вопрос без ответов
   **When** DELETE /api/v1/questions/:id
   **Then** вопрос удаляется (FR4)

8. **Given** вопрос с существующими ответами
   **When** PUT /api/v1/questions/:id или DELETE /api/v1/questions/:id
   **Then** возвращается 409 с errorCode QUESTION_HAS_RESPONSES (FR5)

9. **Given** несуществующий вопрос
   **When** GET/PUT/DELETE /api/v1/questions/:id
   **Then** возвращается 404 с errorCode QUESTION_NOT_FOUND

## Tasks / Subtasks

### Entity и интерфейсы

- [ ] **T1** Добавить в `packages/shared` интерфейс `ICreateQuestionDto` (text: string, type: QuestionType, options?: string[]) и `IUpdateQuestionDto` (text?: string, options?: string[]) в `src/dto/question.dto.ts` [AC1, AC2]
- [ ] **T2** Добавить в `packages/shared` интерфейс `IQuestionResponseDto` (id, text, type, options, hasResponses, createdAt, updatedAt) в `src/dto/question.dto.ts` [AC1]
- [ ] **T3** Добавить `QUESTION_HAS_RESPONSES` и `QUESTION_NOT_FOUND` в `ErrorCode` enum в `packages/shared/src/enums/error-code.enum.ts` [AC8, AC9]
- [ ] **T4** Создать entity `Question` в `apps/api/src/modules/question/entities/question.entity.ts` — колонки: id (PK, auto-increment), text (varchar), type (enum QuestionType), options (jsonb, nullable), createdAt, updatedAt [AC1, AC2]

### Module структура

- [ ] **T5** Создать `question.module.ts` — регистрация контроллера, сервиса, репозитория, TypeORM entity [AC1]
- [ ] **T6** Зарегистрировать `QuestionModule` в `app.module.ts` [AC1]

### DTO с валидацией

- [ ] **T7** Создать `create-question.dto.ts` — класс `CreateQuestionDto implements ICreateQuestionDto`, декораторы: @IsString() text, @IsEnum(QuestionType) type, @IsOptional() @IsArray() @IsString({each: true}) options. Кастомная валидация: options обязательны для closed/matrix/multi_select [AC1, AC2]
- [ ] **T8** Создать `update-question.dto.ts` — класс `UpdateQuestionDto implements IUpdateQuestionDto`, все поля @IsOptional(), аналогичные декораторы. Кастомная валидация: если передан type closed/matrix/multi_select, options обязательны [AC6]
- [ ] **T9** Создать `question-response.dto.ts` — класс `QuestionResponseDto` для Swagger-документации [AC1]
- [ ] **T10** Создать `question-query.dto.ts` — класс для query params: @IsOptional() @IsEnum(QuestionType) questionType, @IsOptional() @IsString() search, @IsOptional() @Type(() => Number) @IsInt() page = 1, @IsOptional() @Type(() => Number) @IsInt() limit = 10 [AC3, AC4, AC5]

### Mapper

- [ ] **T11** Создать `question.mapper.ts` — статический класс `QuestionMapper` с методами: `toResponseDto(entity: Question, hasResponses: boolean): QuestionResponseDto`, `toEntity(dto: CreateQuestionDto): Question` [AC1]

### Repository

- [ ] **T12** Создать `question.repository.ts` — методы: `findAll(query: {questionType?, search?, page, limit}): Promise<{items: Question[], total: number}>`, `findById(id: number): Promise<Question | null>`, `create(entity: Question): Promise<Question>`, `update(entity: Question): Promise<Question>`, `delete(id: number): Promise<void>`, `hasResponses(questionId: number): Promise<boolean>` [AC1-AC9]
- [ ] **T13** В методе `findAll` реализовать: фильтрация по questionType через WHERE, поиск по тексту через ILIKE '%search%', пагинация через skip/take, сортировка по createdAt DESC [AC3, AC4, AC5]
- [ ] **T14** В методе `hasResponses` проверять наличие записей в таблице responses с данным questionId (через LEFT JOIN или EXISTS subquery). На данном этапе таблица responses ещё не существует — метод должен быть готов к её появлению, временно возвращать false [AC8]

### Service

- [ ] **T15** Создать `question.service.ts` — методы: `findAll(query)`, `findById(id)`, `create(dto)`, `update(id, dto)`, `delete(id)` [AC1-AC9]
- [ ] **T16** В `create`: вызвать mapper для трансформации DTO → entity, сохранить через repository [AC1, AC2]
- [ ] **T17** В `findById`: получить из repository, бросить NotFoundException с QUESTION_NOT_FOUND если не найден [AC9]
- [ ] **T18** В `update`: проверить существование, проверить hasResponses — если true, бросить ConflictException с QUESTION_HAS_RESPONSES. Иначе обновить [AC6, AC8]
- [ ] **T19** В `delete`: проверить существование, проверить hasResponses — если true, бросить ConflictException с QUESTION_HAS_RESPONSES. Иначе удалить [AC7, AC8]
- [ ] **T20** В `findAll`: получить из repository, маппить через mapper, вернуть с мета-пагинацией [AC3, AC4, AC5]

### Controller

- [ ] **T21** Создать `question.controller.ts` с префиксом `questions` и API версией v1 [AC1]
- [ ] **T22** `POST /` — принимает CreateQuestionDto, возвращает QuestionResponseDto [AC1, AC2]
- [ ] **T23** `GET /` — принимает QuestionQueryDto (query params), возвращает пагинированный список [AC3, AC4, AC5]
- [ ] **T24** `GET /:id` — возвращает один вопрос [AC9]
- [ ] **T25** `PUT /:id` — принимает UpdateQuestionDto, возвращает обновлённый вопрос [AC6]
- [ ] **T26** `DELETE /:id` — удаляет вопрос, возвращает 200 [AC7]
- [ ] **T27** Добавить Swagger-декораторы (@ApiTags, @ApiOperation, @ApiResponse) на все эндпоинты [AC1]

### Тесты

- [ ] **T28** Создать `question.service.spec.ts` — unit-тесты: создание вопроса, создание с options, фильтрация по типу, поиск по тексту, обновление, удаление, запрет обновления при наличии ответов (409), запрет удаления при наличии ответов (409), 404 при несуществующем вопросе [AC1-AC9]
- [ ] **T29** Создать `question.repository.spec.ts` — unit-тесты: findAll с фильтрацией, findAll с поиском, findAll с пагинацией, hasResponses [AC3-AC5, AC8]

## Dev Notes

### Критические технические требования

- **NestJS 11.1.17**, **TypeORM 0.3.28**, **PostgreSQL**
- `class-validator` + `class-transformer` для валидации DTO
- Swagger через `@nestjs/swagger` с auto-генерацией из DTO
- `QuestionType` enum из `@bmad-cem/shared` (значения: `nps`, `open`, `closed`, `matrix`, `multi_select`)

### Архитектурные решения

- **Strict layering:** Controller -> Service -> Repository + Mapper. Сервис НЕ содержит SQL/QueryBuilder. Repository — единственный слой с доступом к БД.
- **Mapper** — отдельный статический класс, НЕ в сервисе и НЕ в контроллере. Маппинг Entity <-> DTO только через Mapper.
- **Response format:** все ответы оборачиваются глобальным ResponseWrapper interceptor в `{data, meta}`. Контроллер возвращает просто объект/массив.
- **Пагинация:** контроллер передаёт meta с {page, limit, total, totalPages} через декоратор или вручную. ResponseWrapper подхватывает.
- **Error codes:** используются из `ErrorCode` enum в `@bmad-cem/shared`. Бросать кастомные HttpException с дополнительным полем `errorCode`.
- **Entity naming:** класс `Question`, таблица `questions` (множественное число, snake_case). Колонки в entity camelCase, TypeORM naming strategy трансформирует в snake_case.
- **JSONB для options:** массив строк хранится как jsonb-колонка. TypeORM тип `simple-json` или `jsonb`.
- **hasResponses:** На этапе Epic 2 таблица `responses` ещё не создана (появится в Epic 5). Метод `hasResponses` в repository подготовлен, но временно возвращает `false`. Когда появится ResponseEntity, метод обновится на реальный запрос.

### ЗАПРЕТЫ (anti-patterns)

- НЕ писать SQL/QueryBuilder в сервисном слое — только в repository
- НЕ маппить entity в DTO в контроллере или сервисе — только через Mapper
- НЕ возвращать entity напрямую из API — всегда через DTO + Mapper
- НЕ помещать бизнес-логику в контроллер — контроллер только принимает запрос и вызывает сервис
- НЕ использовать `any` тип нигде
- НЕ хардкодить error messages без errorCode
- НЕ менять тип вопроса при редактировании (type immutable после создания) — это ограничение дизайна, type не входит в UpdateQuestionDto
- НЕ создавать entity для responses в этой истории — это scope Epic 5
- НЕ реализовывать soft delete — обычный DELETE

### Previous Story Context

- **Story 1.1** создала monorepo: apps/web, apps/api, packages/shared, packages/config
- **Story 1.2** создала packages/shared с enum-ами (ErrorCode, QuestionType, SurveyStatus, RespondentStatus), интерфейсами DTO, типами API response
- **Story 1.3** настроила NestJS: глобальный ValidationPipe, ExceptionFilter, ResponseWrapper interceptor, Swagger, CORS, TypeORM с PostgreSQL
- **Story 1.4** создала AuthModule с JWT, глобальный JwtAuthGuard, декоратор @Public()
- **Story 1.5** создала frontend app shell, sidebar, layout

QuestionModule — первый доменный модуль. Использовать паттерны из AuthModule как референс для структуры.

### Project Structure Notes

```
apps/api/src/modules/question/
├── question.module.ts
├── question.controller.ts
├── question.service.ts
├── question.service.spec.ts
├── question.repository.ts
├── question.repository.spec.ts
├── question.mapper.ts
├── dto/
│   ├── create-question.dto.ts
│   ├── update-question.dto.ts
│   ├── question-response.dto.ts
│   └── question-query.dto.ts
└── entities/
    └── question.entity.ts
```

**Shared пакет (уже создан, нужно дополнить):**
```
packages/shared/src/
├── dto/question.dto.ts          # Добавить ICreateQuestionDto, IUpdateQuestionDto, IQuestionResponseDto
├── enums/error-code.enum.ts     # Добавить QUESTION_HAS_RESPONSES, QUESTION_NOT_FOUND
└── enums/question-type.enum.ts  # Уже существует: nps, open, closed, matrix, multi_select
```

### References

- PRD: FR1-FR6 (Библиотека вопросов)
- Architecture: Strict layering, Mapper pattern, API versioning, Response format, Error codes
- Architecture: Backend Module Structure template
- Architecture: Shared Package Contract (interfaces only)

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
