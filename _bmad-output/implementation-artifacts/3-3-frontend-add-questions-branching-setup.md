# Story 3.3: Frontend — добавление вопросов и настройка бранчинга

Status: ready-for-dev

## Story

As a пользователь,
I want добавлять вопросы из библиотеки на граф и настраивать бранчинг,
So that я могу собрать опрос с динамической логикой прохождения.

## Acceptance Criteria

1. **Добавление вопроса из библиотеки**
   - Given конструктор открыт
   - When пользователь нажимает "Добавить вопрос" в тулбаре
   - Then открывается список вопросов из библиотеки для выбора
   - And выбранный вопрос появляется как нода на канвасе (FR8)

2. **NPS — автоматические выходы**
   - Given NPS-вопрос добавлен на канвас
   - When нода отображается
   - Then автоматически создаются 3 выходных узла: detractor (0-6), passive (7-8), promoter (9-10) (FR10)

3. **Закрытый вопрос — выходы по вариантам**
   - Given закрытый вопрос добавлен на канвас
   - When нода отображается
   - Then автоматически создаются выходные узлы по количеству вариантов ответа (FR10)

4. **Открытый вопрос — один выход**
   - Given открытый вопрос добавлен на канвас
   - When нода отображается
   - Then создаётся 1 выходной узел (default) (FR10)

5. **Соединение нод рёбрами**
   - Given два вопроса на канвасе
   - When пользователь drag от выходного узла одной ноды к другой ноде
   - Then создаётся ребро (связь), визуально отрисовывается (FR9)

6. **Удаление нод и рёбер**
   - Given нода или ребро на канвасе
   - When пользователь удаляет элемент (клавиша Delete или кнопка)
   - Then элемент удаляется с канваса (FR11)

7. **Боковая панель настроек ноды**
   - Given нода на канвасе
   - When пользователь кликает по ноде
   - Then открывается боковая панель (Sheet 360px) справа с настройками: текст вопроса, тип, варианты (FR12, UX-DR11)
   - And панель закрывается по Esc, клику вне, кнопке "×"

8. **Zustand store обновляется**
   - Given Zustand store создан (surveyFlowStore)
   - When пользователь изменяет граф (добавление/удаление/перемещение)
   - Then state обновляется в Zustand (nodes, edges)
   - And immutable updates (AR15)

## Tasks / Subtasks

- [ ] Task 1: Генерация выходов по типу вопроса (AC: #2, #3, #4)
  - [ ] 1.1 Создать `apps/web/src/lib/questionOutputs.ts`
  - [ ] 1.2 Функция `generateOutputsByType(questionType, options?)` → массив {id, label}:
    - NPS: [{id: 'detractor', label: 'Detractor (0-6)'}, {id: 'passive', label: 'Passive (7-8)'}, {id: 'promoter', label: 'Promoter (9-10)'}]
    - Closed: options.map((opt, i) => ({id: `option-${i}`, label: opt}))
    - Matrix: [{id: 'default', label: 'Далее'}] (один выход, бранчинг по строкам матрицы не поддерживается в MVP)
    - Multi-select: [{id: 'default', label: 'Далее'}] (один выход)
    - Open: [{id: 'default', label: 'Далее'}]
  - [ ] 1.3 Экспортировать для использования в store и SurveyNode

- [ ] Task 2: Расширение surveyFlowStore (AC: #1, #6, #8)
  - [ ] 2.1 Добавить action `addQuestionNode(question: IQuestionResponseDto)`:
    - Вычислить позицию для новой ноды (offset от последней или по сетке)
    - Сгенерировать outputs через generateOutputsByType
    - Создать Node: {id: uuid, type: 'survey', position, data: {questionId, questionText, questionType, outputs}}
    - Добавить в nodes (immutable)
  - [ ] 2.2 Добавить action `removeNode(nodeId)` — удаляет ноду + связанные рёбра
  - [ ] 2.3 Добавить action `removeEdge(edgeId)` — удаляет ребро
  - [ ] 2.4 Добавить action `onConnect(connection)` — создаёт новое ребро из Connection параметра React Flow
  - [ ] 2.5 Добавить action `updateNodeData(nodeId, data)` — для обновления из NodeSettingsPanel

- [ ] Task 3: Диалог выбора вопроса из библиотеки (AC: #1)
  - [ ] 3.1 Создать `apps/web/src/components/survey/QuestionPicker.tsx`
  - [ ] 3.2 Использовать shadcn/ui Dialog
  - [ ] 3.3 Внутри: список вопросов из API (useQuestions hook + React Query)
  - [ ] 3.4 Поиск по тексту с debounce 300ms (UX-DR18)
  - [ ] 3.5 Фильтрация по типу — pill-кнопки (Все / NPS / Открытый / Закрытый / Матричный / Мульти-селект)
  - [ ] 3.6 Каждый вопрос: badge типа с цветом + текст + кнопка "Добавить"
  - [ ] 3.7 При клике "Добавить" — вызвать store.addQuestionNode(question), закрыть диалог

- [ ] Task 4: Подключение кнопки "Добавить вопрос" в FlowToolbar (AC: #1)
  - [ ] 4.1 Обновить FlowToolbar — кнопка "Добавить вопрос" открывает QuestionPicker dialog
  - [ ] 4.2 Передать callback onAddQuestion для интеграции с store

- [ ] Task 5: Соединение нод (AC: #5)
  - [ ] 5.1 В FlowCanvas подключить onConnect callback из surveyFlowStore
  - [ ] 5.2 React Flow prop: `onConnect={store.onConnect}`
  - [ ] 5.3 Стиль рёбер: animated: false, type: 'smoothstep' (плавные кривые)
  - [ ] 5.4 Валидация соединения: isValidConnection — запретить соединение ноды с самой собой

- [ ] Task 6: Удаление нод и рёбер (AC: #6)
  - [ ] 6.1 React Flow prop: `deleteKeyCode="Delete"` (или массив ['Delete', 'Backspace'])
  - [ ] 6.2 onNodesDelete callback → store.removeNode для каждой удалённой ноды
  - [ ] 6.3 onEdgesDelete callback → store.removeEdge для каждого удалённого ребра
  - [ ] 6.4 Запретить удаление WelcomeNode (selectable: true, deletable: false на ноде)

- [ ] Task 7: NodeSettingsPanel — боковая панель настроек (AC: #7)
  - [ ] 7.1 Создать `apps/web/src/components/survey/NodeSettingsPanel.tsx`
  - [ ] 7.2 Использовать shadcn/ui Sheet (side="right", w-[360px])
  - [ ] 7.3 Открывается когда selectedNodeId !== null в store
  - [ ] 7.4 Содержимое зависит от типа ноды:
    - SurveyNode: текст вопроса (readonly), тип (readonly badge), список выходов (readonly)
    - WelcomeNode: текст приветствия (editable), описание опроса (editable)
    - ThankYouNode: текст благодарности (editable)
  - [ ] 7.5 Изменения применяются live (без кнопки "Сохранить") через store.updateNodeData (UX-DR15)
  - [ ] 7.6 Закрытие: кнопка "×", Esc, клик вне панели — store.selectNode(null)

- [ ] Task 8: Интеграция клика по ноде (AC: #7)
  - [ ] 8.1 В FlowCanvas: onNodeClick callback → store.selectNode(nodeId)
  - [ ] 8.2 Клик на пустое пространство канваса → store.selectNode(null)
  - [ ] 8.3 Рендерить NodeSettingsPanel рядом с FlowCanvas (в page.tsx или в FlowCanvas)

## Dev Notes

### Критические технические требования
- **@xyflow/react 12.10.1** — Handle, Position, Connection, useReactFlow
- **Zustand** — все мутации графа через store (AR15)
- **React Query** — загрузка списка вопросов в QuestionPicker (useQuestions hook из story 2.2)
- **shadcn/ui v4** — Dialog (для QuestionPicker), Sheet (для NodeSettingsPanel)
- **QuestionType enum** из @bmad-cem/shared

### Архитектурные решения
- **Типизированные выходы** — ключевая концепция: тип вопроса автоматически определяет количество и семантику выходных Handles ноды. Пользователь НЕ настраивает выходы вручную.
- **Handle id как ключ бранчинга** — sourceHandle в Edge хранит id выхода (detractor, passive, promoter, option-0, option-1, default). Это используется при прохождении опроса для определения следующего вопроса.
- **Node.data** — содержит questionId (ссылка на вопрос в БД), questionText, questionType, outputs[]. Это сериализуется в JSONB при сохранении.
- **Live update из панели** — NodeSettingsPanel обновляет node.data через store, нода перерендеривается автоматически (UX-DR15: без кнопки "Сохранить")
- **Позиционирование новых нод** — при добавлении вычислить свободную позицию: правее/ниже от последней ноды с шагом ~250px по X или ~150px по Y

### ЗАПРЕТЫ (anti-patterns)
- НЕ давать пользователю вручную создавать/настраивать выходы — они генерируются автоматически по типу
- НЕ разрешать удалять WelcomeNode — она обязательна
- НЕ разрешать соединение ноды с самой собой
- НЕ разрешать множественные рёбра из одного выходного Handle (один выход → одна связь)
- НЕ реализовывать сохранение на сервер — это story 3.4
- НЕ реализовывать валидацию — это story 3.5
- НЕ использовать React Hook Form для NodeSettingsPanel — прямые controlled inputs с live update через store
- НЕ мутировать nodes/edges напрямую — только через Zustand actions

### Previous Story Context
- **Story 1.5:** App shell, sidebar, breadcrumb, toast, shadcn/ui компоненты (Dialog, Sheet, Button, Input, Badge, Select)
- **Story 2.2-2.3:** Библиотека вопросов — useQuestions hook (React Query), QuestionFilters, типизированные вопросы с options[]
- **Story 3.1:** Backend API: GET /api/v1/surveys/:id (с flow), PUT /api/v1/surveys/:id/flow
- **Story 3.2:** FlowCanvas, FlowToolbar (заглушки), SurveyNode, WelcomeNode, ThankYouNode, surveyFlowStore (base state + onNodesChange/onEdgesChange)

### Project Structure Notes
```
apps/web/src/
├── components/survey/
│   ├── FlowCanvas.tsx                  # Обновить: onConnect, onNodeClick, delete
│   ├── FlowToolbar.tsx                 # Обновить: кнопка → QuestionPicker
│   ├── SurveyNode.tsx                  # Уже создан в 3.2
│   ├── WelcomeNode.tsx                 # Уже создан в 3.2
│   ├── ThankYouNode.tsx                # Уже создан в 3.2
│   ├── QuestionPicker.tsx              # НОВЫЙ: диалог выбора вопроса
│   └── NodeSettingsPanel.tsx           # НОВЫЙ: боковая панель настроек
├── stores/
│   └── surveyFlowStore.ts             # Расширить: addQuestionNode, removeNode, onConnect, updateNodeData
└── lib/
    └── questionOutputs.ts              # НОВЫЙ: генерация выходов по типу
```

### References
- Architecture: AR13 (flow shared types), AR15 (Zustand + React Query), AR16 (React Hook Form НЕ для panel)
- UX: UX-DR1 (SurveyNode выходы), UX-DR11 (Sheet 360px справа), UX-DR15 (live update без кнопки Сохранить), UX-DR18 (поиск с debounce)
- PRD: FR8 (добавление вопросов из библиотеки), FR9 (соединение рёбрами), FR10 (бранчинг), FR11 (удаление), FR12 (настройка через панель)
- Epics: Story 3.3

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
