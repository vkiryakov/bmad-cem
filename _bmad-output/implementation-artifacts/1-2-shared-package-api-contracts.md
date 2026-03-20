# Story 1.2: Shared пакет — контракты API

Status: review

## Story

As a разработчик,
I want единый пакет с интерфейсами, enum-ами и типами,
So that frontend и backend используют одинаковые контракты без рассинхронизации.

## Acceptance Criteria

1. **Enums созданы**
   - Given packages/shared инициализирован
   - When создаются enum-файлы
   - Then существуют enums: ErrorCode, SurveyStatus (draft/active/completed/archived), QuestionType (nps/open/closed/matrix/multi_select), RespondentStatus (not_opened/opened/in_progress/completed)
   - And все enum-значения соответствуют PRD

2. **DTO-интерфейсы созданы**
   - Given packages/shared
   - When создаются интерфейсы DTO
   - Then существуют интерфейсы: ICreateSurveyDto, IUpdateSurveyDto, ISurveyResponseDto, ICreateQuestionDto, IUpdateQuestionDto, IQuestionResponseDto, IAddRespondentDto, ISubmitAnswerDto, IRespondentResponseDto, IAnalyticsResponseDto, IHeatmapResponseDto
   - And IPaginationMeta (page, limit, total, totalPages), IPaginatedResponse<T>

3. **Типы API-ответов и flow созданы**
   - Given packages/shared
   - When создаются типы
   - Then существуют типы: IApiResponse<T> ({data, meta}), IApiError ({statusCode, message, errorCode}), ISurveyFlow, IFlowNode, IFlowEdge

4. **Flow-validator создан**
   - Given packages/shared
   - When создаётся flow-validator.ts
   - Then содержит pure functions для обнаружения тупиков и циклов в графе
   - And функции не имеют side effects и зависимостей от фреймворков
   - And экспортируются через barrel index.ts

5. **Интеграция с apps подтверждена**
   - Given packages/shared полностью создан
   - When импортируется в apps/web и apps/api
   - Then все типы, интерфейсы и enum-ы доступны без ошибок компиляции

## Tasks / Subtasks

- [x] Task 1: Создание enum-файлов (AC: #1)
  - [x] 1.1 Создать `packages/shared/src/enums/error-code.enum.ts` — ErrorCode enum
  - [x] 1.2 Создать `packages/shared/src/enums/survey-status.enum.ts` — SurveyStatus
  - [x] 1.3 Создать `packages/shared/src/enums/question-type.enum.ts` — QuestionType
  - [x] 1.4 Создать `packages/shared/src/enums/respondent-status.enum.ts` — RespondentStatus

- [x] Task 2: Создание типов API-ответов (AC: #3)
  - [x] 2.1 Создать `packages/shared/src/types/api-response.type.ts` — IApiResponse<T>, IApiError
  - [x] 2.2 Создать `packages/shared/src/types/survey-flow.type.ts` — ISurveyFlow, IFlowNode, IFlowEdge

- [x] Task 3: Создание DTO-интерфейсов (AC: #2)
  - [x] 3.1 Создать `packages/shared/src/dto/survey.dto.ts`
  - [x] 3.2 Создать `packages/shared/src/dto/question.dto.ts`
  - [x] 3.3 Создать `packages/shared/src/dto/respondent.dto.ts`
  - [x] 3.4 Создать `packages/shared/src/dto/analytics.dto.ts`
  - [x] 3.5 Создать `packages/shared/src/dto/pagination.dto.ts`

- [x] Task 4: Создание flow-validator (AC: #4)
  - [x] 4.1 Создать `packages/shared/src/validation/flow-validator.ts`
  - [x] 4.2 Реализовать `validateFlow(flow: ISurveyFlow): IFlowValidationResult`
  - [x] 4.3 Реализовать `findDeadEndNodes(flow: ISurveyFlow): string[]`
  - [x] 4.4 Реализовать `findCycles(flow: ISurveyFlow): string[][]`
  - [x] 4.5 Реализовать `findDisconnectedStart(flow: ISurveyFlow): boolean`
  - [x] 4.6 Реализовать `findUnreachableNodes(flow: ISurveyFlow): string[]`
  - [x] 4.7 Определить типы: IFlowValidationResult, IFlowValidationError, FlowValidationErrorType

- [x] Task 5: Barrel export и верификация (AC: #5)
  - [x] 5.1 Обновить `packages/shared/src/index.ts` — экспорт всех enums, types, dto, validation
  - [x] 5.2 Проверить `turbo build` — packages/shared компилируется без ошибок
  - [x] 5.3 Проверить что apps/web может импортировать
  - [x] 5.4 Проверить что apps/api может импортировать аналогично

## Dev Notes

### Критические технические требования

**Версии (подтверждено, март 2026):**
- TypeScript: 5.x (strict mode)
- pnpm: 10.32.1
- Turborepo: 2.8.20

**AR3 — КРИТИЧЕСКОЕ ПРАВИЛО:** packages/shared содержит ИСКЛЮЧИТЕЛЬНО интерфейсы, enums, типы и pure functions. Никаких классов, декораторов, зависимостей от NestJS/class-validator/TypeORM.

### Архитектурные решения

**Паттерн shared interfaces (AR3):**
```typescript
// packages/shared — ТОЛЬКО интерфейс
export interface ICreateSurveyDto {
  title: string;
  description?: string;
}

// apps/api — РЕАЛИЗАЦИЯ с декораторами (в будущих stories)
export class CreateSurveyDto implements ICreateSurveyDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
}

// apps/web — ИСПОЛЬЗОВАНИЕ интерфейса напрямую
const payload: ICreateSurveyDto = { title: 'NPS Q1' };
```

**Именование интерфейсов:** префикс `I` — `ICreateSurveyDto`, `ISurveyResponseDto`, `IApiResponse<T>`.

**Именование enum-ов:** PascalCase — `SurveyStatus`, `QuestionType`, `ErrorCode`.

**Файлы:** kebab-case — `error-code.enum.ts`, `survey-flow.type.ts`, `flow-validator.ts`.

**Типы данных в API:**
- IDs: числовые (auto-increment) для сущностей, UUID v4 (string) для токенов респондентов
- Даты: ISO 8601 строки в DTO (`string`, не `Date`)
- Null: явный `null` (не undefined) для nullable полей в response DTO
- JSON fields: `camelCase`

**Flow-validator: алгоритмы:**
- Тупики: найти ноды, у которых нет исходящих рёбер И тип ноды !== 'thankYou'
- Циклы: DFS с тремя состояниями вершин (WHITE/GRAY/BLACK), при обнаружении GRAY → цикл
- Disconnected start: проверить что существует хотя бы одно ребро с source === welcomeNodeId
- Unreachable: BFS от WelcomeNode, все непосещённые ноды — unreachable

**Типы нод для flow:**
- `welcome` — стартовая нода (WelcomeNode)
- `thankYou` — финальная нода (ThankYouNode)
- `survey` — нода вопроса (SurveyNode)

### ЗАПРЕТЫ (anti-patterns)

- НЕ использовать классы — только interface, type, enum, функции
- НЕ добавлять зависимости от NestJS, class-validator, TypeORM, React
- НЕ добавлять декораторы (@IsString, @Column и т.д.)
- НЕ использовать `any` type
- НЕ делать side effects в flow-validator (console.log, network calls)
- НЕ экспортировать default — только named exports
- НЕ создавать DTO-классы — это задача apps/api
- НЕ выходить за scope shared пакета — не трогать apps/web и apps/api кроме проверки импортов

### Previous Story Context

**Story 1.1 создала:**
- Monorepo структуру: apps/web, apps/api, packages/shared, packages/config
- packages/shared с пустым barrel export (src/index.ts)
- packages/shared/package.json (name: "@bmad-cem/shared")
- packages/shared/tsconfig.json
- pnpm-workspace.yaml связывающий все пакеты
- Docker Compose с PostgreSQL
- turbo.json с pipeline для dev, build, lint

**Эта история наполняет packages/shared реальными контрактами.** Пустой index.ts заменяется barrel экспортом всех enums, types, dto, validation.

### Project Structure Notes

```
packages/shared/src/
├── index.ts                    # Barrel export
├── dto/
│   ├── survey.dto.ts           # ICreateSurveyDto, IUpdateSurveyDto, ISurveyResponseDto
│   ├── question.dto.ts         # ICreateQuestionDto, IUpdateQuestionDto, IQuestionResponseDto
│   ├── respondent.dto.ts       # IAddRespondentDto, ISubmitAnswerDto, IRespondentResponseDto
│   ├── analytics.dto.ts        # IAnalyticsResponseDto, IHeatmapResponseDto
│   └── pagination.dto.ts       # IPaginationMeta, IPaginatedResponse<T>
├── enums/
│   ├── error-code.enum.ts      # ErrorCode
│   ├── survey-status.enum.ts   # SurveyStatus
│   ├── question-type.enum.ts   # QuestionType
│   └── respondent-status.enum.ts # RespondentStatus
├── types/
│   ├── api-response.type.ts    # IApiResponse<T>, IApiError
│   └── survey-flow.type.ts     # ISurveyFlow, IFlowNode, IFlowEdge
└── validation/
    └── flow-validator.ts       # validateFlow, findDeadEndNodes, findCycles
```

### References

- [Source: planning-artifacts/architecture.md § Shared Package Contract: Interfaces Only]
- [Source: planning-artifacts/architecture.md § Naming Patterns]
- [Source: planning-artifacts/architecture.md § API & Communication Patterns — Error format]
- [Source: planning-artifacts/architecture.md § Format Patterns — API Response Format]
- [Source: planning-artifacts/epics.md § Story 1.2: Shared пакет — контракты API]
- [Source: planning-artifacts/architecture.md § AR3, AR13]
- [Source: planning-artifacts/prd.md § FR14-FR17 Валидация флоу]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References

### Completion Notes List
- 4 enum файла: ErrorCode (16 значений), SurveyStatus (4), QuestionType (5), RespondentStatus (4)
- 2 type файла: IApiResponse<T>, IApiError, ISurveyFlow, IFlowNode, IFlowEdge и связанные
- 5 DTO файлов: survey, question, respondent, analytics, pagination
- flow-validator с 4 pure functions: validateFlow, findDeadEndNodes, findCycles, findDisconnectedStart, findUnreachableNodes
- 11 unit тестов для flow-validator — все проходят
- Barrel export через index.ts — все типы доступны через @bmad-cem/shared
- turbo build проходит для web и api без ошибок

### Change Log
- 2026-03-20: Полная реализация Story 1.2 — контракты API в shared пакете

### File List
- packages/shared/src/index.ts (изменён — barrel export)
- packages/shared/src/enums/error-code.enum.ts (создан)
- packages/shared/src/enums/survey-status.enum.ts (создан)
- packages/shared/src/enums/question-type.enum.ts (создан)
- packages/shared/src/enums/respondent-status.enum.ts (создан)
- packages/shared/src/types/api-response.type.ts (создан)
- packages/shared/src/types/survey-flow.type.ts (создан)
- packages/shared/src/dto/survey.dto.ts (создан)
- packages/shared/src/dto/question.dto.ts (создан)
- packages/shared/src/dto/respondent.dto.ts (создан)
- packages/shared/src/dto/analytics.dto.ts (создан)
- packages/shared/src/dto/pagination.dto.ts (создан)
- packages/shared/src/validation/flow-validator.ts (создан)
- packages/shared/src/__tests__/flow-validator.spec.ts (создан)
- packages/shared/package.json (изменён — добавлен jest)
