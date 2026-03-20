# Story 6.3: Frontend — heatmap на графе

Status: ready-for-dev

## Story

As a пользователь,
I want видеть пути респондентов прямо на графе опроса,
So that я могу найти проблемные ветки и понять, как люди проходят мой опрос.

## Acceptance Criteria

1. **Given** вкладка "Heatmap" активна
   **When** данные загружены
   **Then** отображается React Flow граф опроса в read-only режиме (без drag, без редактирования)
   **And** ноды показывают счётчик респондентов (FR41)

2. **Given** рёбра графа на heatmap
   **When** отображаются HeatmapEdge
   **Then** толщина ребра пропорциональна трафику: thin 1-2px (мало), medium 3-4px, thick 5-6px (много) (UX-DR4)
   **And** цвет: градиент slate-200 -> blue-300 -> blue-600 по объёму трафика

3. **Given** респондент начал, но не завершил путь по ребру
   **When** отображается drop-off
   **Then** ребро отрисовывается пунктирной rose-300 линией (UX-DR4)

4. **Given** heatmap отображается
   **When** проверяется легенда
   **Then** отображается легенда: толщина рёбер, цветовой градиент, пунктир = drop-off

5. **Given** нода на heatmap
   **When** пользователь кликает по ноде
   **Then** открывается боковая панель (Sheet) с детализацией: количество респондентов, распределение ответов для этого вопроса

6. **Given** вкладка "Метрики" (или отдельная секция)
   **When** отображается satisfaction matrix
   **Then** таблица/heatmap: строки — категории вопросов, колонки — метрики (средний балл, распределение) (FR40)

7. **Given** heatmap загружается для опроса с до 500 ответами
   **When** данные агрегированы
   **Then** отображение происходит за < 3 секунды (NFR3)

## Tasks / Subtasks

### React Query хуки для heatmap
- [ ] Добавить в `apps/web/src/hooks/useAnalytics.ts` [AC 1, 7]:
  - `useAnalyticsHeatmap(surveyId, filters)` — GET /api/v1/surveys/:id/analytics/heatmap
  - `useAnalyticsSatisfaction(surveyId, filters)` — GET /api/v1/surveys/:id/analytics/satisfaction
  - `useAnalyticsDistribution(surveyId, filters)` для детализации по ноде — переиспользовать из Story 6.2

### HeatmapEdge кастомное ребро
- [ ] Создать `apps/web/src/components/survey/HeatmapEdge.tsx` [AC 2, 3]:
  - Реализовать как кастомный Edge для @xyflow/react (EdgeProps)
  - Принимать data: { traversalCount, dropOffCount, maxTraversalCount }
  - Вычислять толщину на основе traversalCount / maxTraversalCount:
    - 0-33%: thin (strokeWidth: 1.5)
    - 34-66%: medium (strokeWidth: 3.5)
    - 67-100%: thick (strokeWidth: 5.5)
  - Вычислять цвет по трафику:
    - 0-33%: slate-200 (#e2e8f0)
    - 34-66%: blue-300 (#93c5fd)
    - 67-100%: blue-600 (#2563eb)
  - Drop-off отображение: если dropOffCount > 0, рисовать дополнительный пунктирный path rose-300 (#fda4af), strokeDasharray="6 4"
  - Использовать getSmoothStepPath или getBezierPath из @xyflow/react
  - Опциональная подпись числа traversalCount рядом с ребром (foreignObject)

### Heatmap-режим нод
- [ ] Обновить/создать heatmap-вариант SurveyNode [AC 1]:
  - Добавить отображение счётчика respondentCount (badge в правом верхнем углу ноды)
  - Цвет badge: blue-500, белый текст
  - При respondentCount === 0 — badge серый (slate-300)
  - Сохранить цветовое кодирование типа вопроса

### HeatmapView компонент
- [ ] Создать `apps/web/src/components/analytics/HeatmapView.tsx` [AC 1, 2, 3, 4, 7]:
  - Загрузить survey flow (nodes, edges) через GET /api/v1/surveys/:id
  - Загрузить heatmap data через useAnalyticsHeatmap
  - Смёржить данные: обогатить nodes respondentCount, обогатить edges traversalCount + dropOffCount
  - Вычислить maxTraversalCount для нормализации толщины/цвета
  - Рендерить ReactFlow с:
    - nodeTypes: { survey: SurveyNodeHeatmap, welcome: WelcomeNodeHeatmap, thankYou: ThankYouNodeHeatmap }
    - edgeTypes: { heatmap: HeatmapEdge }
    - Все edges с type: 'heatmap'
    - read-only: nodesDraggable={false}, nodesConnectable={false}, elementsSelectable={true}
    - panOnDrag={true}, zoomOnScroll={true} (навигация сохраняется)
    - fitView для автоматической подгонки под размер
    - MiniMap для навигации по графу
  - Skeleton loading при загрузке данных [AC 7]

### Легенда heatmap
- [ ] Создать компонент HeatmapLegend внутри HeatmapView [AC 4]:
  - Позиционирование: абсолютное, левый нижний угол поверх канваса
  - Содержание:
    - Линии разной толщины: thin / medium / thick с подписями "Мало" / "Средне" / "Много"
    - Цветовой градиент: полоска slate-200 -> blue-300 -> blue-600 с подписями
    - Пунктирная rose-300 линия с подписью "Drop-off"
  - Стиль: bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-3, компактная

### Боковая панель детализации ноды
- [ ] Реализовать клик по ноде -> открытие Sheet [AC 5]:
  - Использовать shadcn/ui Sheet (справа, 360px)
  - При клике на ноду:
    - Показать: текст вопроса, тип вопроса (badge), количество респондентов
    - Загрузить распределение ответов для этого конкретного вопроса (отфильтровать из distribution data)
    - Показать мини-chart (Recharts BarChart) с распределением ответов внутри Sheet
  - Закрытие: Esc, клик вне, кнопка "x"

### SatisfactionMatrix компонент
- [ ] Создать `apps/web/src/components/analytics/SatisfactionMatrix.tsx` [AC 6]:
  - Таблица (shadcn/ui Table): строки = категории вопросов (тип), колонки = метрики
  - Колонки: Категория | Кол-во вопросов | Средний балл | Распределение (мини-bar inline)
  - Для NPS-вопросов: средний балл + мини stacked bar (detractor/passive/promoter)
  - Для закрытых: топ-ответ + процент
  - Цветовое кодирование средних баллов: зелёный > 7, жёлтый 5-7, красный < 5
  - Разместить на вкладке "Метрики" под AnswerDistribution (или отдельной секцией)

### Интеграция в Tabs
- [ ] Заменить placeholder вкладки "Heatmap" на HeatmapView в AnalyticsPageContent [AC 1]
- [ ] Добавить SatisfactionMatrix на вкладку "Метрики" [AC 6]

## Dev Notes

### Критические технические требования
- @xyflow/react 12.10.1 — кастомные nodeTypes и edgeTypes
- Recharts (latest) — для мини-charts в Sheet и SatisfactionMatrix
- shadcn/ui v4: Sheet, Table, Badge, Skeleton
- React Query для data fetching

### Архитектурные решения
- **HeatmapEdge — кастомный Edge:** Реализуется через React Flow edgeTypes registration. Принимает data prop с метриками трафика. Использует SVG path для отрисовки с динамическими strokeWidth и stroke цветом
- **Read-only граф:** Переиспользуется тот же React Flow граф что и в конструкторе (Epic 3), но с другими флагами: nodesDraggable=false, nodesConnectable=false. Ноды отображаются в heatmap-варианте (с badge счётчика)
- **Мёрж данных flow + heatmap:** Flow JSONB (nodes, edges) + heatmap data (nodeId -> respondentCount, edgeId -> traversalCount) = обогащённый граф для отображения. Мёрж выполняется в компоненте HeatmapView (useMemo)
- **Нормализация толщины/цвета:** maxTraversalCount определяется как максимальный traversalCount среди всех рёбер. Каждое ребро получает нормализованное значение ratio = traversalCount / maxTraversalCount для выбора категории (thin/medium/thick) и цвета
- **Sheet детализация:** При клике на ноду сохраняется selectedNodeId в React state (не Zustand — локальное состояние вкладки). Sheet открывается с данными из distribution, отфильтрованными по questionId ноды

### ЗАПРЕТЫ (anti-patterns)
- НЕ делать граф редактируемым в heatmap-режиме — только read-only
- НЕ загружать данные заново при переключении вкладок — React Query кэш
- НЕ реализовывать фильтры в этой story (будут в Story 6.4)
- НЕ использовать D3 для рёбер — только SVG через React Flow API (@xyflow/react path utils)
- НЕ хардкодить пороги толщины в пикселях — использовать процентные диапазоны от maxTraversalCount
- НЕ мутировать nodes/edges массивы — создавать новые через map/spread

### Previous Story Context
- **Epic 1 (Story 1.5):** App shell, Sidebar, layout, Sheet компонент
- **Epic 3 (Story 3.2):** React Flow канвас, SurveyNode, WelcomeNode, ThankYouNode, FlowCanvas — переиспользуется как основа графа
- **Story 6.1:** Backend API — GET /analytics/heatmap (nodes + edges данные), GET /analytics/satisfaction
- **Story 6.2:** Tabs structure (Метрики | Heatmap | Респонденты), MetricsTab, React Query хуки useAnalytics.ts

### Project Structure Notes
```
apps/web/src/
├── components/
│   ├── survey/
│   │   ├── SurveyNode.tsx             # Существует (Epic 3), добавить heatmap state
│   │   ├── WelcomeNode.tsx            # Существует (Epic 3)
│   │   ├── ThankYouNode.tsx           # Существует (Epic 3)
│   │   └── HeatmapEdge.tsx            # НОВЫЙ — кастомное ребро для heatmap
│   └── analytics/
│       ├── HeatmapView.tsx            # НОВЫЙ — React Flow граф в read-only + heatmap
│       ├── SatisfactionMatrix.tsx     # НОВЫЙ — таблица satisfaction matrix
│       ├── MetricCards.tsx            # Существует (Story 6.2)
│       ├── NpsGauge.tsx               # Существует (Story 6.2)
│       └── AnswerDistribution.tsx     # Существует (Story 6.2)
├── hooks/
│   └── useAnalytics.ts               # Обновить — добавить useAnalyticsHeatmap, useAnalyticsSatisfaction
```

### References
- **FR40:** Satisfaction matrix
- **FR41:** Heatmap путей прохождения на графе React Flow
- **NFR3:** Аналитика рассчитывается за < 3 секунды для опросов с до 500 ответами
- **UX-DR1:** SurveyNode — states: heatmap (с счётчиком)
- **UX-DR4:** HeatmapEdge — thin 1-2px, medium 3-4px, thick 5-6px, drop-off: dashed rose, gradient slate-200 -> blue-300 -> blue-600
- **UX-DR11:** Боковая панель настроек 360px справа (Sheet)
- **UX-DR16:** Tabs аналитики: Метрики | Heatmap | Респонденты

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
