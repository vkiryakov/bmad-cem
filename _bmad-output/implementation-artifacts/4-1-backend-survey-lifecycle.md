# Story 4.1: Backend — жизненный цикл опроса

Status: ready-for-dev

## Story

As a пользователь,
I want управлять статусом опроса с чёткими бизнес-правилами,
So that опросы проходят корректный жизненный цикл и данные защищены.

## Acceptance Criteria

1. **Активация опроса с валидным flow**
   - Given опрос в статусе draft с валидным flow
   - When POST /api/v1/surveys/:id/activate
   - Then статус меняется на active (FR18)
   - And flow валидируется на сервере перед активацией (FR17)

2. **Активация опроса с невалидным flow**
   - Given опрос в статусе draft с невалидным flow
   - When POST /api/v1/surveys/:id/activate
   - Then возвращается 400 с errorCode SURVEY_FLOW_INVALID и списком ошибок

3. **Завершение активного опроса**
   - Given опрос в статусе active
   - When POST /api/v1/surveys/:id/complete
   - Then статус меняется на completed (FR19)

4. **Архивация завершённого опроса**
   - Given опрос в статусе completed
   - When POST /api/v1/surveys/:id/archive
   - Then статус меняется на archived (FR20)

5. **Запрет переактивации**
   - Given опрос в статусе completed
   - When POST /api/v1/surveys/:id/activate
   - Then возвращается 409 с errorCode SURVEY_CANNOT_REACTIVATE (FR21)

6. **Запрет удаления опросов**
   - Given опрос в любом статусе
   - When DELETE /api/v1/surveys/:id
   - Then возвращается 403 с errorCode SURVEY_DELETE_FORBIDDEN (FR22)

7. **Невалидный переход статуса**
   - Given невалидный переход статуса (например, archived → active)
   - When выполняется попытка перехода
   - Then возвращается 409 с errorCode SURVEY_INVALID_TRANSITION

8. **Список опросов с поиском и пагинацией**
   - Given существуют опросы
   - When GET /api/v1/surveys?search=NPS&page=1&limit=10
   - Then возвращается список с поиском по названию и пагинацией (FR23)

## Tasks / Subtasks

- [ ] Task 1: Добавить ErrorCode в packages/shared (AC: #2, #5, #6, #7)
  - [ ] 1.1 Добавить в ErrorCode enum: SURVEY_FLOW_INVALID, SURVEY_CANNOT_REACTIVATE, SURVEY_DELETE_FORBIDDEN, SURVEY_INVALID_TRANSITION, SURVEY_NOT_ACTIVE
  - [ ] 1.2 Убедиться что enum экспортируется через barrel index.ts

- [ ] Task 2: Расширить SurveyController — lifecycle эндпоинты (AC: #1-#7)
  - [ ] 2.1 POST /api/v1/surveys/:id/activate — вызов surveyService.activate(id)
  - [ ] 2.2 POST /api/v1/surveys/:id/complete — вызов surveyService.complete(id)
  - [ ] 2.3 POST /api/v1/surveys/:id/archive — вызов surveyService.archive(id)
  - [ ] 2.4 DELETE /api/v1/surveys/:id — всегда возвращать 403 SURVEY_DELETE_FORBIDDEN
  - [ ] 2.5 Swagger-декораторы (@ApiOperation, @ApiResponse) на все эндпоинты

- [ ] Task 3: Расширить SurveyService — бизнес-логика lifecycle (AC: #1-#7)
  - [ ] 3.1 Реализовать приватный метод validateTransition(currentStatus, targetStatus) с матрицей допустимых переходов
  - [ ] 3.2 activate(id): загрузить опрос → проверить status === draft → валидировать flow через flow-validator из @bmad-cem/shared → обновить статус
  - [ ] 3.3 complete(id): загрузить опрос → проверить status === active → обновить статус
  - [ ] 3.4 archive(id): загрузить опрос → проверить status === completed → обновить статус
  - [ ] 3.5 Бросать кастомные HttpException с errorCode для каждого невалидного перехода
  - [ ] 3.6 Отдельная обработка completed → activate: бросать SURVEY_CANNOT_REACTIVATE (не generic SURVEY_INVALID_TRANSITION)

- [ ] Task 4: Расширить SurveyRepository — поиск и фильтрация (AC: #8)
  - [ ] 4.1 Метод findAll(options: { page, limit, search? }) с ILIKE по title
  - [ ] 4.2 Возвращать {data, total} для пагинации

- [ ] Task 5: Расширить SurveyService — список с поиском (AC: #8)
  - [ ] 5.1 Метод findAll(page, limit, search?) — вызов repository + маппинг через SurveyMapper
  - [ ] 5.2 Возвращать IPaginatedResponse<ISurveyResponseDto>

- [ ] Task 6: Расширить SurveyController — GET /surveys с query params (AC: #8)
  - [ ] 6.1 GET /api/v1/surveys?page=1&limit=10&search=NPS
  - [ ] 6.2 DTO для query params (SurveyQueryDto) с class-validator декораторами
  - [ ] 6.3 Default page=1, limit=10

- [ ] Task 7: Матрица переходов статусов (AC: #1, #3, #4, #5, #7)
  - [ ] 7.1 Допустимые переходы: draft→active, active→completed, completed→archived
  - [ ] 7.2 Все остальные переходы запрещены

- [ ] Task 8: Юнит-тесты (AC: #1-#8)
  - [ ] 8.1 survey.service.spec.ts: тесты на каждый допустимый переход статуса
  - [ ] 8.2 Тесты на каждый запрещённый переход (включая completed→active отдельно)
  - [ ] 8.3 Тест на activate с невалидным flow
  - [ ] 8.4 Тест на DELETE → 403
  - [ ] 8.5 Тест на findAll с search и пагинацией

## Dev Notes

### Критические технические требования

**Версии пакетов:**
- NestJS: 11.1.17
- TypeORM: 0.3.28
- class-validator / class-transformer
- packages/shared: flow-validator.ts (pure functions из Story 1.2/3.5)

**Матрица переходов статусов:**
```
draft → active (с валидацией flow)
active → completed
completed → archived
completed → active ❌ SURVEY_CANNOT_REACTIVATE
archived → * ❌ SURVEY_INVALID_TRANSITION
active → draft ❌ SURVEY_INVALID_TRANSITION
```

**Flow-валидация при активации:**
```typescript
import { validateFlow } from '@bmad-cem/shared';

const errors = validateFlow(survey.flow);
if (errors.length > 0) {
  throw new BadRequestException({
    statusCode: 400,
    message: 'Survey flow is invalid',
    errorCode: ErrorCode.SURVEY_FLOW_INVALID,
    errors: errors,
  });
}
```

### Архитектурные решения

**Strict layering (AR4):**
- Controller: принимает HTTP, валидирует DTO, вызывает Service, возвращает ответ
- Service: бизнес-логика переходов, валидация flow, оркестрация
- Repository: findById, updateStatus, findAll с фильтрами
- Mapper: Entity → ResponseDto

**SurveyStatus enum из packages/shared:**
```typescript
enum SurveyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}
```

**Формат ответа ошибки:**
```json
{
  "statusCode": 409,
  "message": "Cannot reactivate completed survey",
  "errorCode": "SURVEY_CANNOT_REACTIVATE"
}
```

**Список опросов — ответ WITHOUT flow (только метаданные):**
```typescript
// GET /api/v1/surveys — НЕ возвращать flow в списке
// flow возвращается только в GET /api/v1/surveys/:id
```

### ЗАПРЕТЫ (anti-patterns)

- НЕ добавлять soft delete — FR22 явно запрещает удаление (только архивация)
- НЕ помещать бизнес-логику переходов в Controller — только в Service
- НЕ использовать QueryBuilder/SQL в Service — только в Repository
- НЕ возвращать Entity напрямую — только через Mapper → DTO
- НЕ хардкодить errorCode строками — только через ErrorCode enum из shared
- НЕ реализовывать CRUD респондентов — это Story 4.2
- НЕ реализовывать фронтенд — это Story 4.3
- НЕ добавлять статус-фильтр в GET /surveys (не указан в AC) — только search по названию

### Previous Story Context

- **Epic 1 (Stories 1.1-1.5):** Monorepo настроен, shared пакет с enums (SurveyStatus, ErrorCode), NestJS bootstrap с global pipes/filters/interceptors, JWT auth
- **Epic 2 (Stories 2.1-2.3):** QuestionModule CRUD готов, вопросы 5 типов создаются/редактируются
- **Epic 3 (Stories 3.1-3.5):** SurveyModule с CRUD + flow JSONB хранение, React Flow конструктор, flow-validator в packages/shared. Survey entity уже существует со статусом draft, flow JSONB колонкой, CRUD эндпоинтами
- **Story 3.5:** flow-validator.ts в packages/shared — pure functions для обнаружения тупиков и циклов. Используется и frontend, и backend

**Эта история расширяет существующий SurveyModule из Epic 3** — добавляет lifecycle-эндпоинты и бизнес-логику переходов.

### Project Structure Notes

**Файлы для модификации:**
```
apps/api/src/modules/survey/
├── survey.controller.ts      # Добавить lifecycle эндпоинты + DELETE
├── survey.service.ts          # Добавить activate/complete/archive + validateTransition
├── survey.service.spec.ts     # Добавить тесты lifecycle
├── survey.repository.ts       # Расширить findAll с search
└── dto/
    └── survey-query.dto.ts    # НОВЫЙ: query params для GET /surveys

packages/shared/src/
├── enums/error-code.enum.ts   # Добавить новые ErrorCode значения
```

### References

- [Source: planning-artifacts/epics.md § Story 4.1: Backend — жизненный цикл опроса]
- [Source: planning-artifacts/architecture.md § Backend Architecture — Strict layering]
- [Source: planning-artifacts/architecture.md § API & Communication Patterns — Error format]
- [Source: planning-artifacts/architecture.md § Shared Package Contract — flow-validator.ts]
- [Source: planning-artifacts/epics.md § Story 3.5: Валидация флоу — flow-validator из shared]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
