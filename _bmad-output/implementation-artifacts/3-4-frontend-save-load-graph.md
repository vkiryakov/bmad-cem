# Story 3.4: Frontend — сохранение и загрузка графа

Status: ready-for-dev

## Story

As a пользователь,
I want чтобы мой граф автоматически сохранялся и загружался,
So that я не потеряю работу над опросом.

## Acceptance Criteria

1. **Ручное сохранение через кнопку**
   - Given пользователь изменил граф (добавил/удалил/переместил ноды)
   - When нажимает кнопку "Сохранить" в тулбаре
   - Then Zustand state (nodes, edges) отправляется на PUT /api/v1/surveys/:id/flow
   - And React Query invalidation обновляет серверный state
   - And toast "Сохранено" на 3 секунды

2. **Загрузка графа при открытии**
   - Given пользователь открывает /surveys/[id]/builder
   - When страница загружается
   - Then flow загружается через GET /api/v1/surveys/:id
   - And nodes и edges из JSONB восстанавливаются в Zustand store
   - And канвас отображает граф в сохранённом состоянии

3. **Skeleton loading при загрузке**
   - Given пользователь открывает конструктор
   - When данные загружаются
   - Then отображается skeleton loading до готовности канваса (UX-DR13)

4. **Обработка ошибки сохранения**
   - Given ошибка при сохранении
   - When API возвращает ошибку
   - Then отображается toast с сообщением об ошибке (не исчезает автоматически)

## Tasks / Subtasks

- [ ] Task 1: React Query hook для опроса (AC: #2, #3)
  - [ ] 1.1 Создать `apps/web/src/hooks/useSurvey.ts`
  - [ ] 1.2 `useSurvey(id)` — useQuery для GET /api/v1/surveys/:id
  - [ ] 1.3 QueryKey: ['surveys', id]
  - [ ] 1.4 Возвращает { data: ISurveyResponseDto, isLoading, error }

- [ ] Task 2: React Query mutation для сохранения flow (AC: #1, #4)
  - [ ] 2.1 Создать `useSaveFlow(id)` в `apps/web/src/hooks/useSurvey.ts`
  - [ ] 2.2 useMutation для PUT /api/v1/surveys/:id/flow
  - [ ] 2.3 onSuccess: invalidateQueries(['surveys', id]), toast("Сохранено", {duration: 3000})
  - [ ] 2.4 onError: toast с текстом ошибки, duration: Infinity (не исчезает, нужно закрыть вручную)
  - [ ] 2.5 Payload: { nodes: store.nodes, edges: store.edges }

- [ ] Task 3: Синхронизация API → Zustand при загрузке (AC: #2)
  - [ ] 3.1 В page.tsx builder: при успешной загрузке useSurvey, вызвать store.loadFlow(survey.flow)
  - [ ] 3.2 Добавить action `loadFlow(flow: ISurveyFlow)` в surveyFlowStore:
    - Если flow.nodes пуст → вызвать initEmptyFlow() (WelcomeNode + ThankYouNode)
    - Иначе → setNodes(flow.nodes), setEdges(flow.edges)
  - [ ] 3.3 Конвертация типов: JSONB nodes/edges → React Flow Node[]/Edge[] (проверить совместимость полей)

- [ ] Task 4: Синхронизация Zustand → API при сохранении (AC: #1)
  - [ ] 4.1 В FlowToolbar: кнопка "Сохранить" вызывает useSaveFlow mutation
  - [ ] 4.2 Сериализация: store.nodes и store.edges → ISurveyFlow для API
  - [ ] 4.3 Кнопка "Сохранить": disabled + текст "Сохранение..." во время mutation (isPending)
  - [ ] 4.4 Добавить индикатор "несохранённые изменения" в store:
    - `isDirty: boolean` — true после любого изменения nodes/edges
    - Сбрасывается в false после успешного сохранения

- [ ] Task 5: Loading state (AC: #3)
  - [ ] 5.1 В page.tsx builder: пока isLoading → отображать skeleton layout
  - [ ] 5.2 Skeleton: FlowToolbar placeholder (h-12 bg-slate-100 animate-pulse) + основная область (h-full bg-slate-50 animate-pulse)
  - [ ] 5.3 После загрузки → рендерить FlowCanvas с данными

- [ ] Task 6: Индикатор несохранённых изменений (AC: #1)
  - [ ] 6.1 В FlowToolbar: если store.isDirty → показать точку или текст "Не сохранено" рядом с кнопкой
  - [ ] 6.2 Стиль: маленький amber badge или точка

- [ ] Task 7: Сериализация/десериализация flow (AC: #1, #2)
  - [ ] 7.1 Создать `apps/web/src/lib/flowSerializer.ts`
  - [ ] 7.2 `serializeFlow(nodes: Node[], edges: Edge[]): ISurveyFlow` — конвертация React Flow типов → shared типы для API
  - [ ] 7.3 `deserializeFlow(flow: ISurveyFlow): { nodes: Node[], edges: Edge[] }` — обратная конвертация
  - [ ] 7.4 Убедиться что позиции нод (x, y), data, type, handles сохраняются корректно

## Dev Notes

### Критические технические требования
- **React Query (TanStack Query)** — useQuery для загрузки, useMutation для сохранения
- **Zustand** — source of truth для текущего состояния графа на клиенте
- **apiClient** — обёртка над fetch/axios с JWT из `apps/web/src/lib/apiClient.ts` (создан в story 1.5)
- **toast** — shadcn/ui toast для обратной связи

### Архитектурные решения
- **Два source of truth:** Zustand — клиентское состояние графа (текущие правки). React Query — серверное состояние (последнее сохранённое). Синхронизация явная: загрузка → store.loadFlow(), сохранение → mutation → invalidation.
- **Сериализация:** React Flow Node/Edge содержат внутренние поля (@xyflow/react). В API отправляем только значимые: id, type, position, data для нод; id, source, sourceHandle, target, targetHandle для рёбер.
- **isDirty tracking:** Zustand middleware или ручной флаг. Любой вызов addNode/removeNode/onNodesChange/onEdgesChange/onConnect → isDirty = true. Успешное сохранение → isDirty = false.
- **Пустой flow:** Если сервер возвращает пустой flow (nodes: [], edges: []) — инициализировать дефолтный граф с WelcomeNode + ThankYouNode.
- **Ошибка загрузки:** Показать EmptyState с кнопкой "Попробовать снова" или автоматический retry через React Query.

### ЗАПРЕТЫ (anti-patterns)
- НЕ использовать автосохранение (debounce auto-save) — только явное сохранение по кнопке. Это MVP, автосохранение усложнит отладку.
- НЕ хранить flow в localStorage как кэш — единственный source of truth для персистентности — API
- НЕ отправлять весь Survey объект при сохранении flow — только PUT /api/v1/surveys/:id/flow с nodes + edges
- НЕ блокировать UI при сохранении — кнопка disabled, но канвас остаётся интерактивным
- НЕ реализовывать undo/redo — out of scope для MVP
- НЕ реализовывать conflict resolution — single-user MVP

### Previous Story Context
- **Story 1.5:** apiClient.ts (fetch/axios с JWT), toast, skeleton loading паттерн
- **Story 3.1:** Backend API: GET /api/v1/surveys/:id (возвращает survey с flow JSONB), PUT /api/v1/surveys/:id/flow (принимает {nodes, edges})
- **Story 3.2:** FlowCanvas, FlowToolbar (кнопка "Сохранить" — заглушка), surveyFlowStore (base state)
- **Story 3.3:** surveyFlowStore расширен: addQuestionNode, removeNode, onConnect, updateNodeData

### Project Structure Notes
```
apps/web/src/
├── app/(admin)/surveys/[id]/builder/
│   └── page.tsx                        # Обновить: useSurvey, loadFlow, skeleton
├── components/survey/
│   └── FlowToolbar.tsx                 # Обновить: кнопка Сохранить → mutation
├── hooks/
│   └── useSurvey.ts                    # НОВЫЙ: useSurvey(id), useSaveFlow(id)
├── stores/
│   └── surveyFlowStore.ts             # Расширить: loadFlow, isDirty
└── lib/
    └── flowSerializer.ts              # НОВЫЙ: serialize/deserialize flow
```

### References
- Architecture: AR15 (Zustand + React Query sync)
- UX: UX-DR13 (skeleton loading, toast 3s)
- PRD: FR7 (создание опроса), FR13 (визуализация графа)
- Epics: Story 3.4

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
