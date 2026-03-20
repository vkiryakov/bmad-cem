# Story 5.1: Backend — публичный API прохождения опроса

Status: ready-for-dev

## Story

As a респондент,
I want пройти опрос по персональной ссылке,
So that я могу поделиться своим мнением быстро и удобно.

## Acceptance Criteria

1. **GET /api/v1/respond/:token — получение опроса и первого вопроса**
   - Given респондент с валидным UUID токеном
   - When GET /api/v1/respond/:token
   - Then возвращается информация об опросе: название, описание, первый вопрос (на основе flow graph от WelcomeNode)
   - And эндпоинт не требует аутентификации (@Public) (NFR9)
   - And статус респондента обновляется на opened (FR28)

2. **POST /api/v1/respond/:token/answer — сохранение ответа и получение следующего вопроса**
   - Given респондент ответил на вопрос
   - When POST /api/v1/respond/:token/answer с {questionId, answer}
   - Then ответ сохраняется в БД (FR37)
   - And статус респондента обновляется на in_progress (FR28)
   - And возвращается следующий вопрос на основе бранчинга (ответ определяет следующую ноду по flow graph)

3. **Бранчинг работает корректно (NPS detractor/passive/promoter)**
   - Given респондент на NPS-вопросе и ответил 3 (detractor)
   - When POST /api/v1/respond/:token/answer с {questionId, answer: 3}
   - Then следующий вопрос определяется по ребру detractor выхода (бранчинг работает)

4. **Завершение опроса (ThankYouNode)**
   - Given респондент ответил на последний вопрос в ветке (следующая нода — ThankYouNode)
   - When POST /api/v1/respond/:token/answer
   - Then статус респондента обновляется на completed (FR28)
   - And возвращается {data: {completed: true}, meta: {}}

5. **Невалидный токен — 404**
   - Given невалидный UUID токен
   - When GET /api/v1/respond/:token
   - Then возвращается 404 с errorCode RESPONDENT_NOT_FOUND

6. **Опрос уже завершён респондентом — 410**
   - Given респондент уже завершил опрос (статус completed)
   - When GET /api/v1/respond/:token
   - Then возвращается 410 с errorCode SURVEY_ALREADY_COMPLETED

7. **Опрос не активен — 410**
   - Given опрос не в статусе active (completed или archived)
   - When GET /api/v1/respond/:token
   - Then возвращается 410 с errorCode SURVEY_NOT_ACTIVE

8. **Возобновление прерванного прохождения**
   - Given респондент в статусе in_progress (прервал ранее)
   - When GET /api/v1/respond/:token
   - Then возвращается следующий неотвеченный вопрос (продолжение с места остановки)

## Tasks / Subtasks

- [ ] Task 1: Создание respondent-public.controller.ts с @Public() декоратором (AC: #1, #5, #6, #7)
  - [ ] 1.1 Создать `apps/api/src/modules/respondent/respondent-public.controller.ts`
  - [ ] 1.2 Добавить @Public() декоратор на контроллер (из `common/decorators/public.decorator.ts`)
  - [ ] 1.3 Реализовать GET /api/v1/respond/:token — вызов respondent.service.getSurveyForRespondent(token)
  - [ ] 1.4 Реализовать POST /api/v1/respond/:token/answer — вызов respondent.service.submitAnswer(token, dto)
  - [ ] 1.5 Зарегистрировать контроллер в RespondentModule

- [ ] Task 2: DTO для публичного API (AC: #1, #2)
  - [ ] 2.1 Создать `apps/api/src/modules/respondent/dto/submit-answer.dto.ts` — class с class-validator: questionId (number, @IsNumber), answer (any — string | number | string[], @IsNotEmpty)
  - [ ] 2.2 Создать `apps/api/src/modules/respondent/dto/survey-start-response.dto.ts` — интерфейс для ответа GET /respond/:token: surveyTitle, surveyDescription, question (или null если completed), totalQuestions, answeredCount
  - [ ] 2.3 Создать `apps/api/src/modules/respondent/dto/next-question-response.dto.ts` — интерфейс для ответа POST answer: question (следующий вопрос или null), completed (boolean)

- [ ] Task 3: Сервисная логика — получение опроса по токену (AC: #1, #5, #6, #7, #8)
  - [ ] 3.1 В respondent.service.ts реализовать `getSurveyForRespondent(token: string)`
  - [ ] 3.2 Найти респондента по токену через respondent.repository — если нет, бросить 404 RESPONDENT_NOT_FOUND
  - [ ] 3.3 Проверить статус опроса — если не active, бросить 410 SURVEY_NOT_ACTIVE
  - [ ] 3.4 Проверить статус респондента — если completed, бросить 410 SURVEY_ALREADY_COMPLETED
  - [ ] 3.5 Если статус not_opened — обновить на opened
  - [ ] 3.6 Если статус in_progress — определить последний отвеченный вопрос и вернуть следующий
  - [ ] 3.7 Если статус opened — вернуть первый вопрос (нода, соединённая с WelcomeNode)

- [ ] Task 4: Сервисная логика — определение первого вопроса из flow graph (AC: #1, #8)
  - [ ] 4.1 Реализовать `getFirstQuestion(flow: ISurveyFlow)` — найти WelcomeNode, по исходящему ребру определить первую ноду-вопрос
  - [ ] 4.2 Реализовать `getNextQuestion(flow: ISurveyFlow, currentNodeId: string, answer: any)` — по ответу определить выходной узел, по ребру от выходного узла найти следующую ноду
  - [ ] 4.3 Обработать случай когда следующая нода — ThankYouNode (возвращать completed: true)

- [ ] Task 5: Логика бранчинга — определение следующего вопроса по ответу (AC: #2, #3)
  - [ ] 5.1 Для NPS: определить категорию по ответу (0-6 = detractor, 7-8 = passive, 9-10 = promoter) и выбрать соответствующий выходной узел
  - [ ] 5.2 Для закрытого вопроса: найти выходной узел, соответствующий выбранному варианту ответа
  - [ ] 5.3 Для открытого, матричного, мульти-селект: использовать default-выход (единственный)
  - [ ] 5.4 По выходному узлу найти ребро, ведущее к следующей ноде

- [ ] Task 6: Сохранение ответа в Response entity (AC: #2, #4)
  - [ ] 6.1 В respondent.service.ts реализовать `submitAnswer(token: string, dto: SubmitAnswerDto)`
  - [ ] 6.2 Валидировать: респондент существует, опрос active, респондент не completed
  - [ ] 6.3 Валидировать: questionId соответствует текущему ожидаемому вопросу (защита от повторной отправки)
  - [ ] 6.4 Создать Response entity: respondentId, questionId, answer (JSONB), answeredAt
  - [ ] 6.5 Сохранить через respondent.repository
  - [ ] 6.6 Обновить статус респондента на in_progress (если ещё не)
  - [ ] 6.7 Определить следующий вопрос через getNextQuestion()
  - [ ] 6.8 Если следующая нода — ThankYouNode: обновить статус респондента на completed

- [ ] Task 7: Возобновление прерванного прохождения (AC: #8)
  - [ ] 7.1 Реализовать `getResumeQuestion(respondentId: number, flow: ISurveyFlow)` — получить все ответы респондента, определить последний отвеченный questionId, по flow graph определить следующий вопрос
  - [ ] 7.2 Использовать логику бранчинга: по последнему ответу определить ветку и следующую ноду

- [ ] Task 8: Расширение Response entity (AC: #2)
  - [ ] 8.1 Убедиться что `apps/api/src/modules/respondent/entities/response.entity.ts` содержит: id, respondentId (FK), questionId (FK), answer (JSONB), answeredAt (timestamp)
  - [ ] 8.2 Добавить связь ManyToOne с Respondent entity
  - [ ] 8.3 Добавить связь ManyToOne с Question entity
  - [ ] 8.4 Добавить индекс на (respondent_id, question_id) для быстрого поиска ответов

- [ ] Task 9: Добавление ErrorCode в shared (AC: #5, #6, #7)
  - [ ] 9.1 Добавить в `packages/shared/src/enums/error-code.enum.ts`: RESPONDENT_NOT_FOUND, SURVEY_ALREADY_COMPLETED, SURVEY_NOT_ACTIVE (если ещё не добавлены в Epic 4)
  - [ ] 9.2 Убедиться что barrel export обновлён

- [ ] Task 10: Маппер для публичного API (AC: #1, #2)
  - [ ] 10.1 Создать или расширить respondent.mapper.ts: toSurveyStartResponse(), toNextQuestionResponse()
  - [ ] 10.2 Маппить Question entity в безопасный формат для респондента (id, text, type, options — без внутренних полей)

## Dev Notes

### Критические технические требования

**Версии пакетов:**
- NestJS: 11.1.17
- TypeORM: 0.3.28
- class-validator / class-transformer — последние версии

**@Public() декоратор (NFR9):**
Публичный API респондента НЕ требует JWT-аутентификации. Декоратор @Public() из `apps/api/src/common/decorators/public.decorator.ts` снимает глобальный JwtAuthGuard. Контроллер respondent-public.controller.ts помечен @Public() целиком.

**Формат ответов API:**
Все ответы обёрнуты в `{ data, meta }` через глобальный ResponseWrapper interceptor (AR7).

### Архитектурные решения

**Strict layering (AR4):**
- `respondent-public.controller.ts` — принимает HTTP, валидация DTO, вызов сервиса
- `respondent.service.ts` — бизнес-логика определения следующего вопроса, бранчинг, обновление статусов
- `respondent.repository.ts` — все запросы к БД (поиск по токену, сохранение ответов)
- `respondent.mapper.ts` — трансформация Entity → DTO

**Два контроллера в одном модуле:**
- `respondent.controller.ts` — admin API (управление респондентами, JWT required) — из Epic 4
- `respondent-public.controller.ts` — public API (прохождение опроса, @Public()) — эта история

**Flow graph навигация:**
Survey entity хранит flow как JSONB (ISurveyFlow из shared). Flow содержит nodes[] и edges[]. Навигация по графу:
1. Найти текущую ноду (nodeId)
2. По ответу определить выходной узел (sourceHandle)
3. Найти ребро с этим source + sourceHandle
4. Target ребра = следующая нода

**NPS бранчинг:**
- 0-6 → detractor handle
- 7-8 → passive handle
- 9-10 → promoter handle

**Закрытый вопрос бранчинг:**
- Каждый вариант ответа = отдельный handle (option-0, option-1, option-2...)

**Открытый/матричный/мульти-селект:**
- Один default handle

**Response entity (ответы респондентов):**
```
Response {
  id: number (PK, auto-increment)
  respondentId: number (FK → respondents.id)
  questionId: number (FK → questions.id)
  answer: jsonb (хранит любой тип ответа: число, строку, массив строк, объект для матрицы)
  answeredAt: timestamp
}
```

**Определение текущего вопроса при возобновлении:**
1. Загрузить все Response для respondentId, отсортировать по answeredAt
2. Взять последний ответ
3. По questionId последнего ответа найти ноду в flow graph
4. По answer последнего ответа определить выходной узел
5. По выходному узлу найти следующую ноду через ребро
6. Если следующая нода — ThankYouNode, значит респондент завершил (обновить статус)

### ЗАПРЕТЫ (anti-patterns)

- НЕ добавлять JWT-аутентификацию на публичные эндпоинты — используется @Public()
- НЕ хранить ответы в localStorage на backend — только в БД через Response entity
- НЕ возвращать Entity напрямую из API — всегда через Mapper → DTO
- НЕ помещать SQL/QueryBuilder в сервисный слой — только в Repository
- НЕ помещать бизнес-логику бранчинга в контроллер — только в Service
- НЕ создавать frontend компоненты — это Story 5.2 и 5.3
- НЕ реализовывать localStorage persistence — это Story 5.3 (frontend)
- НЕ реализовывать прогресс-бар или навигацию — это Story 5.3 (frontend)
- НЕ менять API admin-эндпоинтов из Epic 4 — только добавлять public API
- НЕ использовать `any` type (кроме answer field, который typed как union)

### Previous Story Context

**Epic 4 (Story 4.1, 4.2) создали:**
- RespondentModule с respondent.controller.ts (admin), respondent.service.ts, respondent.repository.ts, respondent.mapper.ts
- Respondent entity: id, email, token (UUID v4), surveyId (FK), status (RespondentStatus enum), createdAt
- Response entity: apps/api/src/modules/respondent/entities/response.entity.ts (базовая структура)
- SurveyModule с survey entity, flow (JSONB), lifecycle (Draft→Active→Completed→Archived)
- QuestionModule с question entity (5 типов: nps, open, closed, matrix, multi_select)
- Shared enums: RespondentStatus (not_opened, opened, in_progress, completed), ErrorCode, SurveyStatus, QuestionType

**Epic 3 (Story 3.1) создал:**
- Survey.flow — JSONB с ISurveyFlow (nodes + edges)
- Типы ISurveyFlow, IFlowNode, IFlowEdge в packages/shared

**Epic 1 создал:**
- Глобальный JwtAuthGuard с поддержкой @Public() декоратора
- Глобальный ResponseWrapper interceptor ({ data, meta })
- Глобальный ExceptionFilter с errorCode
- Глобальный ValidationPipe (whitelist: true, forbidNonWhitelisted: true)

### Project Structure Notes

**Файлы этой истории:**
```
apps/api/src/modules/respondent/
├── respondent-public.controller.ts    # НОВЫЙ — @Public() контроллер
├── respondent.controller.ts           # Существует (Epic 4, admin)
├── respondent.service.ts              # Расширить — добавить публичные методы
├── respondent.repository.ts           # Расширить — запросы для публичного API
├── respondent.mapper.ts               # Расширить — маппинг для публичного API
├── respondent.module.ts               # Обновить — зарегистрировать новый контроллер
├── dto/
│   ├── submit-answer.dto.ts           # НОВЫЙ или расширить
│   ├── survey-start-response.dto.ts   # НОВЫЙ
│   └── next-question-response.dto.ts  # НОВЫЙ
└── entities/
    ├── respondent.entity.ts           # Существует (Epic 4)
    └── response.entity.ts             # Расширить — связи, индексы
```

**Shared пакет (может потребоваться обновление):**
```
packages/shared/src/
├── enums/error-code.enum.ts           # Добавить новые коды если нет
├── types/survey-flow.type.ts          # Используется для навигации по графу
└── dto/respondent.dto.ts              # ISubmitAnswerDto interface
```

### References

- [Source: planning-artifacts/epics.md § Story 5.1: Backend — публичный API прохождения опроса]
- [Source: planning-artifacts/architecture.md § Authentication & Security — @Public() decorator]
- [Source: planning-artifacts/architecture.md § Architectural Boundaries — Public API]
- [Source: planning-artifacts/architecture.md § Backend Architecture — Strict layering]
- [Source: planning-artifacts/architecture.md § Project Structure — respondent module]
- [Source: planning-artifacts/architecture.md § Data Architecture — JSONB flow storage]
- [Source: planning-artifacts/prd.md § FR30-FR37 UX респондента]
- [Source: planning-artifacts/prd.md § NFR4 — следующий вопрос < 1 секунда]
- [Source: planning-artifacts/prd.md § NFR9 — публичный API без аутентификации]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
