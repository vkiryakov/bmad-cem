# Story 3.2: Frontend — канвас React Flow и базовые ноды

Status: ready-for-dev

## Story

As a пользователь,
I want видеть визуальный граф-конструктор с кастомными нодами,
So that я могу визуально конструировать структуру опроса.

## Acceptance Criteria

1. **React Flow канвас на странице конструктора**
   - Given пользователь создал опрос
   - When открывает /surveys/[id]/builder
   - Then отображается React Flow канвас на всю ширину контентной области
   - And тулбар 48px сверху с названием опроса и кнопками действий (FR13)

2. **WelcomeNode и ThankYouNode при создании**
   - Given новый опрос (пустой flow)
   - When открывается конструктор
   - Then на канвасе автоматически создана WelcomeNode (slate-цвет, один выход "Начать") (UX-DR2)
   - And ThankYouNode доступна для добавления (slate-цвет, без выходов) (UX-DR3)

3. **SurveyNode — кастомная нода вопроса**
   - Given канвас с нодами
   - When отображается SurveyNode для вопроса
   - Then нода показывает: цветную точку типа + текст (truncate 30 символов) + выходные узлы (UX-DR1)
   - And цвет соответствует типу: NPS/blue, открытый/emerald, закрытый/violet, матричный/amber, мульти-селект/pink
   - And ширина ноды ~160-200px

4. **Selected state ноды**
   - Given SurveyNode на канвасе
   - When нода выделена
   - Then отображается синяя обводка (selected state) (UX-DR1)

5. **Мини-карта**
   - Given канвас с нодами
   - When проверяется мини-карта
   - Then мини-карта React Flow отображается для навигации по большим графам

6. **Производительность**
   - Given канвас с нодами
   - When проверяется производительность
   - Then канвас плавно работает с графом до 50 нод (NFR2)

## Tasks / Subtasks

- [ ] Task 1: Страница конструктора (AC: #1)
  - [ ] 1.1 Создать `apps/web/src/app/(admin)/surveys/[id]/builder/page.tsx`
  - [ ] 1.2 Layout: FlowToolbar (48px сверху) + FlowCanvas (flex-1, вся доступная площадь)
  - [ ] 1.3 FlowToolbar отображает название опроса (из API), кнопки-заглушки: "Добавить вопрос", "Сохранить", "Валидация"
  - [ ] 1.4 Breadcrumb: Опросы → {название} → Конструктор (max 3 уровня)

- [ ] Task 2: FlowCanvas компонент (AC: #1, #5, #6)
  - [ ] 2.1 Создать `apps/web/src/components/survey/FlowCanvas.tsx`
  - [ ] 2.2 Импорт из `@xyflow/react` (НЕ из `reactflow`): ReactFlow, MiniMap, Controls, Background
  - [ ] 2.3 Подключить `@xyflow/react/dist/style.css`
  - [ ] 2.4 Зарегистрировать кастомные nodeTypes: { survey: SurveyNode, welcome: WelcomeNode, thankYou: ThankYouNode }
  - [ ] 2.5 Включить MiniMap для навигации
  - [ ] 2.6 Background с сеткой (BackgroundVariant.Dots)
  - [ ] 2.7 Включить fitView для автоматического масштабирования при первой загрузке

- [ ] Task 3: Zustand store — surveyFlowStore (AC: #2, #4)
  - [ ] 3.1 Создать `apps/web/src/stores/surveyFlowStore.ts`
  - [ ] 3.2 State: nodes (Node[]), edges (Edge[]), selectedNodeId (string | null)
  - [ ] 3.3 Actions: setNodes, setEdges, onNodesChange, onEdgesChange (обёртки для React Flow handlers)
  - [ ] 3.4 Action: selectNode(nodeId) — устанавливает selectedNodeId
  - [ ] 3.5 Action: initEmptyFlow() — создаёт WelcomeNode + ThankYouNode с дефолтными позициями
  - [ ] 3.6 Immutable updates через spread operator

- [ ] Task 4: WelcomeNode компонент (AC: #2)
  - [ ] 4.1 Создать `apps/web/src/components/survey/WelcomeNode.tsx`
  - [ ] 4.2 Стиль: slate-100 фон, slate-600 border, rounded-xl, width 160px
  - [ ] 4.3 Content: иконка (Play или аналог) + текст "Welcome"
  - [ ] 4.4 Один выходной Handle (Position.Bottom или Position.Right) с id "start", label "Начать"
  - [ ] 4.5 States: default, selected (ring-2 ring-blue-400)
  - [ ] 4.6 Использовать Handle из @xyflow/react

- [ ] Task 5: ThankYouNode компонент (AC: #2)
  - [ ] 5.1 Создать `apps/web/src/components/survey/ThankYouNode.tsx`
  - [ ] 5.2 Стиль: slate-100 фон, slate-600 border, rounded-xl, width 160px
  - [ ] 5.3 Content: иконка (CheckCircle или аналог) + текст "Спасибо"
  - [ ] 5.4 Один входной Handle (Position.Top или Position.Left), без выходных Handles
  - [ ] 5.5 States: default, selected (ring-2 ring-blue-400)

- [ ] Task 6: SurveyNode компонент (AC: #3, #4)
  - [ ] 6.1 Создать `apps/web/src/components/survey/SurveyNode.tsx`
  - [ ] 6.2 Props через data: questionText (string), questionType (QuestionType), outputs (array of {id, label})
  - [ ] 6.3 Header: цветная точка (8px, rounded-full) цвета типа + текст вопроса (truncate 30 символов, font-medium 13px)
  - [ ] 6.4 Body: список выходных Handles с labels (font-normal 11px)
  - [ ] 6.5 Цветовая схема по типу:
    - NPS: bg-blue-50, border-blue-400, точка bg-blue-400
    - Открытый: bg-emerald-50, border-emerald-400, точка bg-emerald-400
    - Закрытый: bg-violet-50, border-violet-400, точка bg-violet-400
    - Матричный: bg-amber-50, border-amber-400, точка bg-amber-400
    - Мульти-селект: bg-pink-50, border-pink-400, точка bg-pink-400
  - [ ] 6.6 Один входной Handle (Position.Top или Position.Left)
  - [ ] 6.7 Выходные Handles: генерируются из outputs массива, каждый с уникальным id
  - [ ] 6.8 Width: 180px (в пределах 160-200px)
  - [ ] 6.9 States: default (border-1), selected (ring-2 ring-blue-400), error (ring-2 ring-rose-400 bg-rose-50/50)
  - [ ] 6.10 aria-label с полным текстом вопроса

- [ ] Task 7: FlowToolbar компонент (AC: #1)
  - [ ] 7.1 Создать `apps/web/src/components/survey/FlowToolbar.tsx`
  - [ ] 7.2 Layout: h-12 (48px), flex, items-center, justify-between, border-b, bg-white, px-4
  - [ ] 7.3 Left: название опроса (h3, semibold)
  - [ ] 7.4 Right: кнопки — "Добавить вопрос" (outline), "Сохранить" (outline), "Валидация" (outline)
  - [ ] 7.5 Кнопки — заглушки на этом этапе (функциональность в stories 3.3, 3.4, 3.5)
  - [ ] 7.6 Placeholder для ValidationAlert (пустой div, заполнится в story 3.5)

- [ ] Task 8: Цветовые утилиты для типов вопросов (AC: #3)
  - [ ] 8.1 Создать `apps/web/src/lib/questionTypeColors.ts`
  - [ ] 8.2 Маппинг QuestionType → {bg, border, dot, bgLight}: объект с Tailwind-классами для каждого типа
  - [ ] 8.3 Экспортировать функцию `getQuestionTypeColors(type: QuestionType)`

## Dev Notes

### Критические технические требования
- **@xyflow/react 12.10.1** — это переименованный reactflow. Импорт: `import { ReactFlow, Handle, Position, MiniMap, Controls, Background } from '@xyflow/react'`
- **НЕ использовать** `import ... from 'reactflow'` — пакет переименован
- **CSS:** Обязательно импортировать `@xyflow/react/dist/style.css`
- **Zustand** для state графа (AR15), React Query для серверного state
- **shadcn/ui v4** для кнопок и UI-элементов тулбара

### Архитектурные решения
- **nodeTypes** — объект с кастомными нодами передаётся в ReactFlow. Определяется ВНЕ рендер-функции (memo или модульный уровень) для предотвращения пересоздания
- **Zustand store** — surveyFlowStore хранит nodes + edges. React Flow подключается через onNodesChange/onEdgesChange из store
- **Immutable updates** — Zustand actions используют spread operator для обновления nodes/edges (AR15)
- **Handle id** — уникальные id для каждого выходного хэндла ноды, формат: `output-{index}` или semantic (detractor, passive, promoter)
- **Стили нод** — Tailwind CSS классы, совместимые со стилями shadcn/ui (UX-DR9, UX-DR10)
- **Канвас layout** — UX-DR11: канвас full-width, тулбар 48px сверху, боковая панель 360px справа (панель добавится в 3.3)

### ЗАПРЕТЫ (anti-patterns)
- НЕ использовать `import ... from 'reactflow'` — только `@xyflow/react`
- НЕ определять nodeTypes внутри рендер-функции компонента (вызывает пересоздание и потерю состояния)
- НЕ мутировать nodes/edges напрямую — только через Zustand actions с immutable updates
- НЕ реализовывать добавление вопросов из библиотеки — это story 3.3
- НЕ реализовывать сохранение/загрузку — это story 3.4
- НЕ реализовывать валидацию — это story 3.5
- НЕ реализовывать NodeSettingsPanel (боковая панель настроек) — это story 3.3
- НЕ использовать inline styles — только Tailwind классы

### Previous Story Context
- **Story 1.1:** Monorepo, apps/web с Next.js 16, shadcn/ui v4 инициализирован
- **Story 1.2:** Shared пакет: QuestionType enum (nps, open, closed, matrix, multi_select), ISurveyFlow/IFlowNode/IFlowEdge типы
- **Story 1.5:** App shell: sidebar 240px, admin layout, Breadcrumb компонент, EmptyState, toast, skeleton loading
- **Story 2.2-2.3:** Библиотека вопросов — React Query hooks для загрузки вопросов (useQuestions)
- **Story 3.1:** Backend API: GET /api/v1/surveys/:id возвращает опрос с flow

### Project Structure Notes
```
apps/web/src/
├── app/(admin)/surveys/[id]/builder/
│   └── page.tsx                        # Страница конструктора
├── components/survey/
│   ├── FlowCanvas.tsx                  # React Flow канвас
│   ├── FlowToolbar.tsx                 # Тулбар сверху (48px)
│   ├── SurveyNode.tsx                  # Кастомная нода вопроса
│   ├── WelcomeNode.tsx                 # Стартовая нода
│   └── ThankYouNode.tsx                # Финальная нода
├── stores/
│   └── surveyFlowStore.ts             # Zustand store для графа
└── lib/
    └── questionTypeColors.ts           # Цветовой маппинг типов вопросов
```

### References
- Architecture: AR13 (flow validation shared), AR15 (Zustand + React Query)
- UX: UX-DR1 (SurveyNode), UX-DR2 (WelcomeNode), UX-DR3 (ThankYouNode), UX-DR9 (цвета), UX-DR10 (типографика), UX-DR11 (layout)
- PRD: FR13 (визуализация как направленный граф), NFR2 (до 50 нод)
- Epics: Story 3.2

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
