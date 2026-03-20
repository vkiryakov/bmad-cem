# Story 1.2: Shared пакет — контракты API

Status: ready-for-dev

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

- [ ] Task 1: Создание enum-файлов (AC: #1)
  - [ ] 1.1 Создать `packages/shared/src/enums/error-code.enum.ts` — ErrorCode enum со значениями: AUTH_INVALID_CREDENTIALS, AUTH_UNAUTHORIZED, SURVEY_NOT_FOUND, SURVEY_ALREADY_ACTIVE, SURVEY_CANNOT_REACTIVATE, SURVEY_INVALID_TRANSITION, SURVEY_DELETE_FORBIDDEN, SURVEY_FLOW_INVALID, SURVEY_NOT_ACTIVE, QUESTION_NOT_FOUND, QUESTION_HAS_RESPONSES, RESPONDENT_NOT_FOUND, RESPONDENT_ALREADY_EXISTS, SURVEY_ALREADY_COMPLETED, INTERNAL_ERROR, VALIDATION_ERROR
  - [ ] 1.2 Создать `packages/shared/src/enums/survey-status.enum.ts` — SurveyStatus: DRAFT = 'draft', ACTIVE = 'active', COMPLETED = 'completed', ARCHIVED = 'archived'
  - [ ] 1.3 Создать `packages/shared/src/enums/question-type.enum.ts` — QuestionType: NPS = 'nps', OPEN = 'open', CLOSED = 'closed', MATRIX = 'matrix', MULTI_SELECT = 'multi_select'
  - [ ] 1.4 Создать `packages/shared/src/enums/respondent-status.enum.ts` — RespondentStatus: NOT_OPENED = 'not_opened', OPENED = 'opened', IN_PROGRESS = 'in_progress', COMPLETED = 'completed'

- [ ] Task 2: Создание типов API-ответов (AC: #3)
  - [ ] 2.1 Создать `packages/shared/src/types/api-response.type.ts` — IApiResponse<T> { data: T; meta: Record<string, unknown> }, IApiError { statusCode: number; message: string; errorCode: ErrorCode }
  - [ ] 2.2 Создать `packages/shared/src/types/survey-flow.type.ts` — ISurveyFlow { nodes: IFlowNode[]; edges: IFlowEdge[] }, IFlowNode { id: string; type: string; position: { x: number; y: number }; data: IFlowNodeData }, IFlowNodeData { questionId?: number; questionType?: QuestionType; label: string; outputs: IFlowNodeOutput[] }, IFlowNodeOutput { id: string; label: string }, IFlowEdge { id: string; source: string; sourceHandle: string; target: string }

- [ ] Task 3: Создание DTO-интерфейсов (AC: #2)
  - [ ] 3.1 Создать `packages/shared/src/dto/survey.dto.ts` — ICreateSurveyDto { title: string; description?: string }, IUpdateSurveyDto { title?: string; description?: string }, ISurveyResponseDto { id: number; title: string; description: string | null; status: SurveyStatus; flow: ISurveyFlow | null; questionCount: number; respondentCount: number; completedCount: number; createdAt: string; updatedAt: string }
  - [ ] 3.2 Создать `packages/shared/src/dto/question.dto.ts` — ICreateQuestionDto { text: string; type: QuestionType; options?: string[] }, IUpdateQuestionDto { text?: string; options?: string[] }, IQuestionResponseDto { id: number; text: string; type: QuestionType; options: string[] | null; hasResponses: boolean; createdAt: string; updatedAt: string }
  - [ ] 3.3 Создать `packages/shared/src/dto/respondent.dto.ts` — IAddRespondentDto { email: string } | { emails: string[] }, ISubmitAnswerDto { questionId: number; answer: string | number | string[] | Record<string, string> }, IRespondentResponseDto { id: number; email: string; token: string; link: string; status: RespondentStatus; createdAt: string }
  - [ ] 3.4 Создать `packages/shared/src/dto/analytics.dto.ts` — IAnalyticsResponseDto { totalRespondents: number; completedRespondents: number; completionRate: number; averageNps: number | null; npsBreakdown: INpsBreakdown | null }, INpsBreakdown { detractors: number; passives: number; promoters: number; detractorPercent: number; passivePercent: number; promoterPercent: number }, IHeatmapResponseDto { nodes: IHeatmapNode[]; edges: IHeatmapEdge[] }, IHeatmapNode { nodeId: string; respondentCount: number }, IHeatmapEdge { edgeId: string; traversalCount: number; dropOffCount: number }
  - [ ] 3.5 Создать `packages/shared/src/dto/pagination.dto.ts` — IPaginationMeta { page: number; limit: number; total: number; totalPages: number }, IPaginatedResponse<T> { data: T[]; meta: IPaginationMeta }

- [ ] Task 4: Создание flow-validator (AC: #4)
  - [ ] 4.1 Создать `packages/shared/src/validation/flow-validator.ts`
  - [ ] 4.2 Реализовать `validateFlow(flow: ISurveyFlow): IFlowValidationResult` — основная функция, возвращает { valid: boolean; errors: IFlowValidationError[] }
  - [ ] 4.3 Реализовать `findDeadEndNodes(flow: ISurveyFlow): string[]` — поиск нод без исходящих рёбер (кроме ThankYouNode)
  - [ ] 4.4 Реализовать `findCycles(flow: ISurveyFlow): string[][]` — поиск циклов в графе (DFS), возвращает массив циклов (массивов nodeId)
  - [ ] 4.5 Реализовать `findDisconnectedStart(flow: ISurveyFlow): boolean` — проверка что WelcomeNode соединена хотя бы с одной нодой
  - [ ] 4.6 Реализовать `findUnreachableNodes(flow: ISurveyFlow): string[]` — поиск нод, недостижимых от WelcomeNode
  - [ ] 4.7 Определить типы: IFlowValidationResult { valid: boolean; errors: IFlowValidationError[] }, IFlowValidationError { type: FlowValidationErrorType; message: string; nodeIds: string[]; edgeIds?: string[] }, FlowValidationErrorType enum (DEAD_END, CYCLE, DISCONNECTED_START, UNREACHABLE_NODE)

- [ ] Task 5: Barrel export и верификация (AC: #5)
  - [ ] 5.1 Обновить `packages/shared/src/index.ts` — экспорт всех enums, types, dto, validation
  - [ ] 5.2 Проверить `turbo build` — packages/shared компилируется без ошибок
  - [ ] 5.3 Проверить что apps/web может импортировать: `import { ErrorCode, SurveyStatus, ICreateSurveyDto } from '@bmad-cem/shared'`
  - [ ] 5.4 Проверить что apps/api может импортировать аналогично

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

### Debug Log References

### Completion Notes List

### File List
