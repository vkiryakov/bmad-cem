# Story 4.2: Backend — управление респондентами и генерация ссылок

Status: ready-for-dev

## Story

As a пользователь,
I want добавлять респондентов и получать персональные ссылки для рассылки,
So that я могу распространить опрос среди своих клиентов.

## Acceptance Criteria

1. **Добавление одного респондента**
   - Given опрос в статусе active
   - When POST /api/v1/surveys/:id/respondents с {email: "client@example.com"}
   - Then респондент создаётся с уникальным UUID v4 токеном (FR24, FR25, NFR8)
   - And возвращается {data: {id, email, token, link, status}, meta: {}}

2. **Batch-добавление респондентов**
   - Given опрос в статусе active
   - When POST /api/v1/surveys/:id/respondents с {emails: ["a@b.com", "c@d.com"]}
   - Then респонденты создаются batch, каждый с уникальным UUID v4 токеном

3. **Дедупликация по email**
   - Given респондент с email уже добавлен в этот опрос
   - When POST /api/v1/surveys/:id/respondents с тем же email
   - Then возвращается 409 с errorCode RESPONDENT_ALREADY_EXISTS (FR26)

4. **Список респондентов с пагинацией и поиском**
   - Given респонденты добавлены
   - When GET /api/v1/surveys/:id/respondents?page=1&limit=10&search=client
   - Then возвращается список с пагинацией и поиском по email (FR27)

5. **Начальный статус респондента**
   - Given респондент создан
   - When проверяется начальный статус
   - Then статус = not_opened (FR28)

6. **Переходы статусов респондента**
   - Given респондент открывает ссылку (будущий Epic 5)
   - When статус обновляется
   - Then переходы: not_opened → opened → in_progress → completed (FR28)

7. **Drop-off трекинг**
   - Given респондент начал, но не завершил опрос
   - When проверяется статус
   - Then статус = in_progress, фиксируется последний отвеченный вопрос для трекинга drop-off (FR29)

8. **Запрет добавления в неактивный опрос**
   - Given опрос не в статусе active
   - When POST /api/v1/surveys/:id/respondents
   - Then возвращается 409 с errorCode SURVEY_NOT_ACTIVE

## Tasks / Subtasks

- [ ] Task 1: Создать Respondent entity (AC: #1, #5, #6, #7)
  - [ ] 1.1 Создать apps/api/src/modules/respondent/entities/respondent.entity.ts
  - [ ] 1.2 Колонки: id (PK, auto-increment), email (string), token (UUID v4, unique), status (RespondentStatus enum), surveyId (FK → surveys), lastQuestionId (nullable, для drop-off), createdAt, updatedAt
  - [ ] 1.3 Unique constraint: (surveyId, email) — дедупликация в рамках опроса
  - [ ] 1.4 Index на token (idx_respondents_token) для быстрого поиска по ссылке

- [ ] Task 2: Создать RespondentModule (AC: #1-#8)
  - [ ] 2.1 respondent.module.ts — импорт TypeOrmModule.forFeature([Respondent]), SurveyModule
  - [ ] 2.2 Зарегистрировать controller, service, repository, mapper

- [ ] Task 3: Создать RespondentRepository (AC: #1, #3, #4)
  - [ ] 3.1 respondent.repository.ts
  - [ ] 3.2 create(respondent) — сохранение одного респондента
  - [ ] 3.3 createBatch(respondents) — batch insert
  - [ ] 3.4 findBySurveyAndEmail(surveyId, email) — для проверки дедупликации
  - [ ] 3.5 findAllBySurvey(surveyId, { page, limit, search? }) — ILIKE по email + пагинация
  - [ ] 3.6 findByToken(token) — поиск по UUID токену
  - [ ] 3.7 updateStatus(id, status, lastQuestionId?) — обновление статуса и drop-off

- [ ] Task 4: Создать RespondentMapper (AC: #1, #2, #4)
  - [ ] 4.1 respondent.mapper.ts
  - [ ] 4.2 toResponseDto(entity) → IRespondentResponseDto (id, email, token, link, status, createdAt)
  - [ ] 4.3 Генерация link: `${FRONTEND_URL}/respond/${token}`

- [ ] Task 5: Создать DTO (AC: #1, #2, #3)
  - [ ] 5.1 dto/add-respondent.dto.ts — implements IAddRespondentDto: email? (string, @IsEmail), emails? (string[], @IsArray @IsEmail each). Один из двух обязателен
  - [ ] 5.2 dto/respondent-response.dto.ts — для Swagger документации
  - [ ] 5.3 dto/respondent-query.dto.ts — page, limit, search (query params)

- [ ] Task 6: Создать RespondentService (AC: #1-#8)
  - [ ] 6.1 respondent.service.ts
  - [ ] 6.2 addRespondent(surveyId, email): проверить что опрос active → проверить дедупликацию → создать с UUID v4 токеном → вернуть через mapper
  - [ ] 6.3 addRespondentsBatch(surveyId, emails): проверить что опрос active → для каждого email проверить дедупликацию → batch create → вернуть массив через mapper
  - [ ] 6.4 findAll(surveyId, page, limit, search?) → пагинированный список
  - [ ] 6.5 updateStatus(token, status, lastQuestionId?) — для будущего Epic 5
  - [ ] 6.6 Использовать crypto.randomUUID() или uuid.v4() для генерации токенов

- [ ] Task 7: Создать RespondentController (AC: #1, #2, #4, #8)
  - [ ] 7.1 respondent.controller.ts — под JwtAuthGuard (admin API)
  - [ ] 7.2 POST /api/v1/surveys/:surveyId/respondents — добавление (single или batch)
  - [ ] 7.3 GET /api/v1/surveys/:surveyId/respondents — список с пагинацией и поиском
  - [ ] 7.4 Swagger-декораторы на все эндпоинты

- [ ] Task 8: Добавить ErrorCode в packages/shared (AC: #3, #8)
  - [ ] 8.1 Добавить: RESPONDENT_ALREADY_EXISTS, RESPONDENT_NOT_FOUND, SURVEY_NOT_ACTIVE (если не добавлен в 4.1)

- [ ] Task 9: Добавить RespondentStatus enum в packages/shared (AC: #5, #6)
  - [ ] 9.1 Убедиться что RespondentStatus (not_opened, opened, in_progress, completed) существует в packages/shared/src/enums/respondent-status.enum.ts (создан в Story 1.2)

- [ ] Task 10: Юнит-тесты (AC: #1-#8)
  - [ ] 10.1 respondent.service.spec.ts: тест на создание одного респондента
  - [ ] 10.2 Тест на batch-создание
  - [ ] 10.3 Тест на дедупликацию (409)
  - [ ] 10.4 Тест на добавление в неактивный опрос (409)
  - [ ] 10.5 Тест на начальный статус not_opened
  - [ ] 10.6 Тест на findAll с search и пагинацией

## Dev Notes

### Критические технические требования

**Версии пакетов:**
- NestJS: 11.1.17
- TypeORM: 0.3.28
- uuid или crypto.randomUUID() для UUID v4 генерации (NFR8)

**UUID v4 для токенов (NFR8):**
```typescript
import { randomUUID } from 'crypto';

const token = randomUUID(); // Node.js built-in, не нужен пакет uuid
```

**Формат персональной ссылки:**
```
https://{FRONTEND_URL}/respond/{uuid-v4-token}
// Пример: http://localhost:3000/respond/550e8400-e29b-41d4-a716-446655440000
```

**RespondentStatus enum из packages/shared:**
```typescript
enum RespondentStatus {
  NOT_OPENED = 'not_opened',
  OPENED = 'opened',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}
```

### Архитектурные решения

**Новый модуль: RespondentModule** — отдельный от SurveyModule (AR: модули по доменам)

**Strict layering (AR4):**
- Controller → Service → Repository + Mapper
- Service проверяет статус опроса через SurveyService (или SurveyRepository injection)
- Repository содержит все SQL/QueryBuilder операции
- Mapper трансформирует Entity → DTO

**Entity Respondent:**
```typescript
@Entity('respondents')
@Unique(['surveyId', 'email']) // Дедупликация в рамках опроса
export class Respondent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ unique: true })
  token: string; // UUID v4

  @Column({ type: 'enum', enum: RespondentStatus, default: RespondentStatus.NOT_OPENED })
  status: RespondentStatus;

  @Column()
  surveyId: number;

  @ManyToOne(() => Survey)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @Column({ nullable: true })
  lastQuestionId: number; // Drop-off tracking (FR29)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Дедупликация (FR26):**
- Unique constraint на (surveyId, email) в entity
- Предварительная проверка в Service перед insert (для batch — более чистые ошибки)
- Для batch: фильтровать дубликаты, вернуть только созданных + список уже существующих

**Формат ответа API:**
```json
// POST — одиночный
{
  "data": { "id": 1, "email": "a@b.com", "token": "550e8400-...", "link": "http://localhost:3000/respond/550e8400-...", "status": "not_opened" },
  "meta": {}
}

// POST — batch
{
  "data": [
    { "id": 1, "email": "a@b.com", "token": "...", "link": "...", "status": "not_opened" },
    { "id": 2, "email": "c@d.com", "token": "...", "link": "...", "status": "not_opened" }
  ],
  "meta": {}
}

// GET — список с пагинацией
{
  "data": [...],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

### ЗАПРЕТЫ (anti-patterns)

- НЕ создавать respondent-public.controller.ts — это Epic 5 (публичный API прохождения)
- НЕ реализовывать приём ответов (submit-answer) — это Epic 5
- НЕ использовать последовательные/предсказуемые токены — только UUID v4 (NFR8)
- НЕ помещать SQL/QueryBuilder в Service — только в Repository
- НЕ возвращать Entity напрямую — только через Mapper → DTO
- НЕ хардкодить FRONTEND_URL — брать из ConfigModule / env
- НЕ создавать Response entity (для ответов) — это Epic 5
- НЕ реализовывать frontend — это Stories 4.3, 4.4

### Previous Story Context

- **Epic 1 (Stories 1.1-1.5):** Monorepo, shared пакет с enums (RespondentStatus), NestJS с global pipes/filters, JWT auth
- **Epic 2 (Stories 2.1-2.3):** QuestionModule готов
- **Epic 3 (Stories 3.1-3.5):** SurveyModule с CRUD + flow JSONB, Survey entity существует
- **Story 4.1:** SurveyModule расширен lifecycle-эндпоинтами (activate/complete/archive), Survey entity имеет status колонку с SurveyStatus enum

**Эта история создаёт новый RespondentModule** — зависит от SurveyModule для проверки статуса опроса.

### Project Structure Notes

**Новые файлы:**
```
apps/api/src/modules/respondent/
├── respondent.module.ts
├── respondent.controller.ts          # Admin API (JWT)
├── respondent.service.ts
├── respondent.service.spec.ts
├── respondent.repository.ts
├── respondent.mapper.ts
├── dto/
│   ├── add-respondent.dto.ts
│   ├── respondent-response.dto.ts
│   └── respondent-query.dto.ts
└── entities/
    └── respondent.entity.ts
```

**Файлы для модификации:**
```
apps/api/src/app.module.ts            # Зарегистрировать RespondentModule
packages/shared/src/enums/error-code.enum.ts  # Добавить ErrorCode значения
```

### References

- [Source: planning-artifacts/epics.md § Story 4.2: Backend — управление респондентами и генерация ссылок]
- [Source: planning-artifacts/architecture.md § Backend Module Structure — respondent/]
- [Source: planning-artifacts/architecture.md § Data Boundaries — Respondent owner: RespondentModule]
- [Source: planning-artifacts/architecture.md § Authentication & Security — UUID v4 для ссылок]
- [Source: planning-artifacts/architecture.md § Naming Patterns — Database: respondents, idx_respondents_token]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
