# Story 3.5: Валидация флоу — обнаружение ошибок и подсветка

Status: ready-for-dev

## Story

As a пользователь,
I want валидировать граф опроса перед запуском,
So that респонденты не столкнутся с тупиками или зацикливанием.

## Acceptance Criteria

1. **Запуск валидации из тулбара**
   - Given граф собран
   - When пользователь нажимает "Валидация" в тулбаре
   - Then вызывается flow-validator из packages/shared (AR13)
   - And результат отображается в ValidationAlert в тулбаре (UX-DR8)

2. **Обнаружение тупиков**
   - Given граф содержит ноду без исходящих рёбер (не ThankYouNode)
   - When запускается валидация
   - Then обнаруживается тупик (FR14)
   - And проблемная нода подсвечивается coral-цветом (rose-400) (FR16)

3. **Обнаружение циклов**
   - Given граф содержит цикл (нода A → B → C → A)
   - When запускается валидация
   - Then обнаруживается цикл (FR15)
   - And ноды и рёбра цикла подсвечиваются coral-цветом (FR16)

4. **Несоединённая стартовая нода**
   - Given WelcomeNode не соединена ни с одной нодой
   - When запускается валидация
   - Then обнаруживается ошибка "Стартовая нода не соединена"

5. **Кликабельный список ошибок**
   - Given валидация обнаружила ошибки
   - When отображается ValidationAlert
   - Then показывается список ошибок с типом и описанием каждой (UX-DR8)
   - And клик на ошибку центрирует канвас на проблемной ноде

6. **Успешная валидация**
   - Given валидация пройдена успешно
   - When отображается ValidationAlert
   - Then показывается зелёное сообщение "Флоу валиден" (UX-DR8)

7. **Backend валидация при активации (подготовка)**
   - Given граф невалиден
   - When backend получает запрос на активацию опроса (из будущего Epic 4)
   - Then валидация выполняется на сервере (тот же flow-validator из shared)
   - And активация блокируется, возвращается 400 с errorCode SURVEY_FLOW_INVALID и списком ошибок (FR17)

8. **Производительность валидации**
   - Given валидация флоу выполняется
   - When граф содержит до 50 нод
   - Then валидация завершается за < 1 секунду (NFR5)

## Tasks / Subtasks

- [ ] Task 1: flow-validator в packages/shared (AC: #1, #2, #3, #4, #8)
  - [ ] 1.1 Создать/дополнить `packages/shared/src/validation/flow-validator.ts`
  - [ ] 1.2 Интерфейс результата:
    ```typescript
    interface IFlowValidationError {
      type: 'dead_end' | 'cycle' | 'disconnected_start' | 'unreachable_node';
      nodeIds: string[];
      edgeIds?: string[];
      message: string;
    }
    interface IFlowValidationResult {
      valid: boolean;
      errors: IFlowValidationError[];
    }
    ```
  - [ ] 1.3 Функция `validateFlow(flow: ISurveyFlow): IFlowValidationResult` — главная точка входа
  - [ ] 1.4 Функция `findDeadEnds(nodes, edges)` — ноды без исходящих рёбер (кроме ThankYouNode). Возвращает IFlowValidationError[]
  - [ ] 1.5 Функция `findCycles(nodes, edges)` — обнаружение циклов через DFS (visited/recursionStack). Возвращает IFlowValidationError[] с nodeIds и edgeIds цикла
  - [ ] 1.6 Функция `checkStartConnection(nodes, edges)` — проверка что WelcomeNode (type: 'welcome') имеет хотя бы одно исходящее ребро
  - [ ] 1.7 Функция `findUnreachableNodes(nodes, edges)` — ноды недостижимые от WelcomeNode через BFS/DFS
  - [ ] 1.8 Все функции — pure, без side effects, без зависимостей от фреймворков
  - [ ] 1.9 Экспортировать через barrel index.ts

- [ ] Task 2: Тесты для flow-validator (AC: #2, #3, #4, #8)
  - [ ] 2.1 Создать `packages/shared/src/validation/flow-validator.spec.ts`
  - [ ] 2.2 Тест: валидный граф (welcome → question → thankYou) → valid: true
  - [ ] 2.3 Тест: тупик (нода без выходов, не ThankYouNode) → dead_end error
  - [ ] 2.4 Тест: цикл (A → B → C → A) → cycle error с nodeIds [A, B, C]
  - [ ] 2.5 Тест: WelcomeNode не соединена → disconnected_start error
  - [ ] 2.6 Тест: недостижимая нода → unreachable_node error
  - [ ] 2.7 Тест: несколько ошибок одновременно → все обнаруживаются
  - [ ] 2.8 Тест: граф с 50 нодами → выполняется за < 1 секунду

- [ ] Task 3: ValidationAlert компонент (AC: #1, #5, #6)
  - [ ] 3.1 Создать `apps/web/src/components/survey/ValidationAlert.tsx`
  - [ ] 3.2 Props: validationResult (IFlowValidationResult | null), onErrorClick (nodeId: string) => void
  - [ ] 3.3 State null: ничего не отображается
  - [ ] 3.4 State success (valid: true): зелёная inline-полоска с иконкой check + текст "Флоу валиден", bg-emerald-50 border-emerald-400 text-emerald-700
  - [ ] 3.5 State error (valid: false): coral inline-alert bg-rose-50 border-rose-400
    - Заголовок: "Обнаружены ошибки ({count})"
    - Список: каждая ошибка — кликабельная строка с иконкой типа + message
    - Клик на ошибку → onErrorClick(error.nodeIds[0])
  - [ ] 3.6 Максимальная высота с scroll (max-h-48 overflow-y-auto) для большого количества ошибок
  - [ ] 3.7 Кнопка "×" для закрытия алерта

- [ ] Task 4: Подсветка ошибок на канвасе (AC: #2, #3)
  - [ ] 4.1 Добавить в surveyFlowStore: `validationErrors: IFlowValidationError[]`, action `setValidationErrors(errors)`
  - [ ] 4.2 Добавить computed `errorNodeIds: Set<string>` и `errorEdgeIds: Set<string>` из validationErrors
  - [ ] 4.3 В SurveyNode: если node.id в errorNodeIds → применить error state (ring-2 ring-rose-400 bg-rose-50/50)
  - [ ] 4.4 В WelcomeNode: аналогично — error state при наличии в errorNodeIds
  - [ ] 4.5 Для рёбер: передать errorEdgeIds в FlowCanvas, рёбра с id из errorEdgeIds → стиль stroke: rose-400, strokeWidth: 2

- [ ] Task 5: Центрирование канваса на проблемной ноде (AC: #5)
  - [ ] 5.1 Использовать `useReactFlow()` hook из @xyflow/react
  - [ ] 5.2 Метод `fitView({ nodes: [{ id: nodeId }], duration: 500 })` или `setCenter(x, y, { zoom, duration })`
  - [ ] 5.3 При клике на ошибку в ValidationAlert → найти ноду по id → центрировать канвас с анимацией
  - [ ] 5.4 Дополнительно: выделить ноду (store.selectNode(nodeId)) для привлечения внимания

- [ ] Task 6: Интеграция в FlowToolbar (AC: #1)
  - [ ] 6.1 Обновить FlowToolbar: кнопка "Валидация" вызывает validateFlow(serializeFlow(store.nodes, store.edges))
  - [ ] 6.2 Результат сохраняется в store (setValidationErrors) и передаётся в ValidationAlert
  - [ ] 6.3 ValidationAlert рендерится внутри FlowToolbar или сразу под ним
  - [ ] 6.4 При изменении графа (добавление/удаление нод/рёбер) — сбросить validationErrors (store.clearValidationErrors)

- [ ] Task 7: Backend интеграция валидации (AC: #7)
  - [ ] 7.1 В `apps/api/src/modules/survey/survey.service.ts`: добавить метод `validateFlow(surveyId)`
  - [ ] 7.2 Импортировать validateFlow из @bmad-cem/shared
  - [ ] 7.3 Вызвать validateFlow(survey.flow), если !result.valid → бросить BadRequestException с errorCode SURVEY_FLOW_INVALID и errors в body
  - [ ] 7.4 Добавить ErrorCode SURVEY_FLOW_INVALID в packages/shared/src/enums/error-code.enum.ts (если не добавлен)
  - [ ] 7.5 Этот метод будет вызываться в Story 4.1 при активации опроса — сейчас только подготовить

## Dev Notes

### Критические технические требования
- **packages/shared** — flow-validator.ts: ТОЛЬКО pure functions, НИКАКИХ зависимостей от фреймворков (AR13, AR3)
- **@xyflow/react 12.10.1** — useReactFlow() для fitView/setCenter
- **Алгоритмы графа:** DFS для обнаружения циклов (O(V+E)), BFS для reachability
- **ISurveyFlow, IFlowNode, IFlowEdge** из packages/shared/src/types/survey-flow.type.ts

### Архитектурные решения
- **Shared validator** — один и тот же код валидации используется на frontend (мгновенная обратная связь) и backend (блокировка активации невалидного опроса). Это ключевое архитектурное решение (AR13).
- **Pure functions** — validateFlow, findDeadEnds, findCycles, checkStartConnection — все без side effects. Принимают ISurveyFlow, возвращают IFlowValidationResult. Тестируются unit-тестами.
- **Error nodeIds/edgeIds** — каждая ошибка содержит список затронутых нод и рёбер. Frontend использует эти id для подсветки на канвасе.
- **Сброс ошибок** — при любом изменении графа (addNode, removeNode, onConnect и т.д.) validationErrors сбрасываются, подсветка исчезает. Пользователь должен заново нажать "Валидация".
- **ThankYouNode — не тупик** — алгоритм dead_end явно исключает ноды типа 'thankYou' из проверки.

### ЗАПРЕТЫ (anti-patterns)
- НЕ использовать классы, декораторы, зависимости от NestJS/React в flow-validator.ts — ТОЛЬКО pure functions
- НЕ запускать валидацию автоматически при каждом изменении графа — только по кнопке (MVP)
- НЕ блокировать UI во время валидации — она быстрая (< 1 сек для 50 нод)
- НЕ реализовывать кнопку "Активировать" — это story 4.1. Только подготовить backend-метод
- НЕ показывать модальное окно с ошибками — только inline ValidationAlert (UX-DR8)
- НЕ модифицировать node.data для подсветки ошибок — использовать отдельный Set в store для errorNodeIds

### Previous Story Context
- **Story 1.2:** packages/shared создан, barrel export через index.ts, ISurveyFlow/IFlowNode/IFlowEdge типы, ErrorCode enum
- **Story 3.1:** Backend SurveyModule, survey.service.ts — метод findById для получения flow
- **Story 3.2:** FlowCanvas, FlowToolbar (кнопка "Валидация" — заглушка), SurveyNode с error state, surveyFlowStore
- **Story 3.3:** surveyFlowStore расширен (addQuestionNode, removeNode, onConnect)
- **Story 3.4:** flowSerializer.ts (serializeFlow), useSurvey hook

### Project Structure Notes
```
packages/shared/src/
├── validation/
│   ├── flow-validator.ts               # Pure functions: validateFlow, findDeadEnds, findCycles
│   └── flow-validator.spec.ts          # Unit тесты
├── types/
│   └── survey-flow.type.ts             # ISurveyFlow, IFlowNode, IFlowEdge (уже есть)
└── enums/
    └── error-code.enum.ts              # + SURVEY_FLOW_INVALID

apps/web/src/
├── components/survey/
│   ├── ValidationAlert.tsx             # НОВЫЙ: inline-алерт результатов валидации
│   ├── FlowToolbar.tsx                 # Обновить: кнопка Валидация → validateFlow
│   ├── FlowCanvas.tsx                  # Обновить: подсветка error рёбер
│   └── SurveyNode.tsx                  # Обновить: error state из store.errorNodeIds
└── stores/
    └── surveyFlowStore.ts             # Расширить: validationErrors, errorNodeIds, errorEdgeIds

apps/api/src/modules/survey/
└── survey.service.ts                   # Расширить: метод validateFlow (подготовка для Epic 4)
```

### References
- Architecture: AR3 (shared — только интерфейсы и pure functions), AR13 (flow validation в shared)
- UX: UX-DR1 (error state ноды), UX-DR8 (ValidationAlert: success green, error coral, клик → центрирование)
- PRD: FR14 (тупики), FR15 (циклы), FR16 (подсветка), FR17 (блокировка активации), NFR5 (< 1 сек)
- Epics: Story 3.5

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
