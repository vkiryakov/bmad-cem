# Story 6.4: Frontend — фильтры и drill-down по респонденту

Status: ready-for-dev

## Story

As a пользователь,
I want фильтровать аналитику и просматривать путь конкретного респондента,
So that я могу находить паттерны и понимать индивидуальный опыт клиентов.

## Acceptance Criteria

1. **Given** страница аналитики
   **When** пользователь нажимает "Фильтры"
   **Then** отображается dropdown-панель с фильтрами: диапазон дат, респондент (select), ветка флоу (select) (FR42, UX-DR18)

2. **Given** фильтры применены
   **When** отображается страница аналитики
   **Then** активные фильтры показываются как badges рядом с кнопкой "Фильтры" (UX-DR18)
   **And** все метрики, графики и heatmap пересчитываются с учётом фильтров

3. **Given** фильтр по конкретному респонденту
   **When** применён
   **Then** heatmap подсвечивает только путь этого респондента

4. **Given** вкладка "Респонденты" активна
   **When** отображается таблица
   **Then** колонки: email, статус (badge), NPS оценка, время прохождения
   **And** пагинация и поиск по email

5. **Given** респондент в таблице
   **When** пользователь кликает по строке
   **Then** отображается полный путь: последовательность вопросов -> ответы -> timestamps (FR43)
   **And** визуально как timeline/список шагов

6. **Given** фильтр по дате применён
   **When** диапазон дат не содержит ответов
   **Then** EmptyState: "Нет данных за выбранный период"

7. **Given** пользователь хочет сбросить фильтры
   **When** нажимает "x" на badge фильтра или "Сбросить всё"
   **Then** фильтры очищаются, данные обновляются

## Tasks / Subtasks

### Состояние фильтров
- [ ] Создать состояние фильтров в React state (useState) на уровне AnalyticsPageContent [AC 1, 2, 7]:
  - `filters: { dateFrom?: string, dateTo?: string, respondentId?: number, branch?: string }`
  - Передавать filters во все React Query хуки (useAnalyticsSummary, useAnalyticsDistribution, useAnalyticsHeatmap)
  - При изменении filters -> React Query автоматически перезапрашивает данные (queryKey включает filters)

### Компонент AnalyticsFilters
- [ ] Создать `apps/web/src/components/analytics/AnalyticsFilters.tsx` [AC 1, 2, 6, 7]:
  - Кнопка "Фильтры" (Outline Button) с иконкой Filter (lucide-react)
  - По клику открывается DropdownMenu (shadcn/ui) или Popover с панелью фильтров
  - Внутри панели:
    - **Диапазон дат:** два Input type="date" (от / до) или DatePicker если установлен
    - **Респондент:** Select (shadcn/ui) с поиском по email, данные из GET /api/v1/surveys/:id/respondents
    - **Ветка флоу:** Select с вариантами веток (вычисляются из flow graph — уникальные пути от WelcomeNode)
  - Кнопка "Применить" — применяет фильтры
  - Кнопка "Сбросить" — очищает все фильтры [AC 7]

### Badges активных фильтров
- [ ] Реализовать отображение активных фильтров как badges [AC 2, 7]:
  - Рядом с кнопкой "Фильтры" — горизонтальный ряд Badge (shadcn/ui)
  - Каждый badge: текст фильтра + кнопка "x" для удаления
  - Дата: "20.03.2026 - 25.03.2026"
  - Респондент: "user@example.com"
  - Ветка: "Ветка: detractor"
  - Клик на "x" -> удаляет один фильтр, данные обновляются [AC 7]
  - "Сбросить всё" ссылка появляется при 2+ активных фильтрах [AC 7]

### Интеграция фильтров с React Query
- [ ] Обновить все хуки в `useAnalytics.ts` — передавать filters в query params [AC 2]:
  - `useAnalyticsSummary(surveyId, filters)` -> GET ?dateFrom=...&dateTo=...&respondentId=...
  - `useAnalyticsDistribution(surveyId, filters)` -> аналогично
  - `useAnalyticsHeatmap(surveyId, filters)` -> аналогично
  - queryKey должен включать filters: `['analytics', 'summary', surveyId, filters]`
  - При изменении filters React Query автоматически рефетчит

### Фильтр респондента на heatmap
- [ ] Когда respondentId задан в фильтрах [AC 3]:
  - Heatmap API возвращает данные только для этого респондента
  - На графе подсвечивается только его путь (остальные рёбра — серые, тонкие)
  - Ноды на его пути — выделены, остальные — приглушены (opacity-40)

### React Query хук для респондентов аналитики
- [ ] Добавить в `useAnalytics.ts` [AC 4, 5]:
  - `useAnalyticsRespondents(surveyId, { page, limit, search })` — GET /api/v1/surveys/:id/respondents (переиспользовать существующий endpoint, обогатить NPS и временем)
  - `useRespondentPath(surveyId, respondentId)` — GET /api/v1/surveys/:id/analytics/respondents/:respondentId/path

### Вкладка "Респонденты" — таблица
- [ ] Создать `apps/web/src/components/analytics/RespondentsTab.tsx` [AC 4]:
  - Поле поиска по email с debounce 300ms (UX-DR18)
  - Таблица (shadcn/ui Table):
    - Колонка "Email" — текст
    - Колонка "Статус" — Badge с цветом (not_opened: серый, opened: синий, in_progress: amber, completed: зелёный)
    - Колонка "NPS" — оценка если есть, "-" если нет
    - Колонка "Время прохождения" — вычислить как разница между первым и последним ответом, формат "Xм Yс"
  - Пагинация внизу: "Показано X из Y" + кнопки навигации (UX-DR17)
  - Клик по строке -> открыть RespondentPathView [AC 5]
  - Skeleton loading при загрузке
  - EmptyState при отсутствии респондентов

### RespondentPathView — drill-down
- [ ] Создать `apps/web/src/components/analytics/RespondentPathView.tsx` [AC 5]:
  - Открывается в Sheet (справа, 420px) или как раскрывающаяся секция под строкой
  - Заголовок: email респондента + статус (badge) + общее время прохождения
  - Визуализация пути как вертикальный timeline:
    - Каждый шаг: точка + линия (как timeline)
    - Содержание шага:
      - Текст вопроса (h4, slate-800)
      - Тип вопроса (badge, мелкий)
      - Ответ респондента (body, slate-600)
      - Время ответа (small, slate-400, формат "HH:mm, DD.MM.YYYY")
    - Линия между шагами: вертикальная slate-200, 2px
  - Последний элемент: "Завершил опрос" или "Drop-off: покинул на вопросе N" (rose-400)
  - Кнопка "Закрыть" или "x"

### EmptyState для отфильтрованных данных
- [ ] Реализовать EmptyState при пустых результатах фильтрации [AC 6]:
  - "Нет данных за выбранный период" — при фильтре по дате без результатов
  - "Респондент не найден" — при фильтре по respondentId без данных
  - Кнопка "Сбросить фильтры" в EmptyState

### Интеграция в Tabs
- [ ] Заменить placeholder вкладки "Респонденты" на RespondentsTab в AnalyticsPageContent [AC 4]
- [ ] Добавить AnalyticsFilters над Tabs (общие для всех вкладок) [AC 1, 2]

## Dev Notes

### Критические технические требования
- Next.js 16.2.0, React 19
- shadcn/ui v4: Select, Popover/DropdownMenu, Badge, Table, Sheet, Pagination, Input
- TanStack Query (React Query) — queryKey с filters для автоматического рефетча
- lucide-react: Filter, X, Search, Clock, User иконки
- date-fns или Intl.DateTimeFormat для форматирования дат

### Архитектурные решения
- **Фильтры — React state, не URL:** Фильтры хранятся в useState на уровне AnalyticsPageContent. Не используем URL query params (усложняет без видимой пользы для single-user). Не используем Zustand (локальный state страницы)
- **React Query queryKey с фильтрами:** `['analytics', 'summary', surveyId, JSON.stringify(filters)]` — при изменении filters автоматически вызывается новый запрос. staleTime: 30 секунд
- **Ветки флоу для фильтра:** Вычисляются на frontend из flow JSONB — DFS от WelcomeNode, каждый уникальный путь до ThankYouNode = ветка. Названия веток формируются из ключевых решений (например: "NPS -> detractor -> ...")
- **RespondentPath timeline:** Чистый CSS timeline (вертикальная линия + точки), не внешняя библиотека. Адаптируется к количеству шагов
- **Debounce поиска:** useDebounce хук (custom или из usehooks-ts), 300ms. Поиск передаётся в query params React Query
- **Пагинация респондентов:** Серверная пагинация через page/limit query params. Используется существующий Pagination компонент (Epic 1)

### ЗАПРЕТЫ (anti-patterns)
- НЕ хранить фильтры в Zustand — это локальный state страницы аналитики
- НЕ загружать всех респондентов на клиент для клиентской пагинации — только серверная пагинация
- НЕ использовать сторонние timeline-библиотеки — CSS вертикальная линия достаточна
- НЕ вычислять аналитику на фронтенде — все агрегации выполняет backend (Story 6.1)
- НЕ мутировать props и state напрямую
- НЕ использовать `any` type
- НЕ дублировать API-запросы между вкладками — React Query кэш разделяется

### Previous Story Context
- **Epic 1 (Story 1.5):** App shell, Pagination, EmptyState, Skeleton, Toast, Badge, Table
- **Epic 4 (Story 4.4):** Страница респондентов опроса — таблица респондентов с badge статусов (переиспользовать паттерн)
- **Story 6.1:** Backend API — все эндпоинты аналитики с поддержкой query params фильтрации (dateFrom, dateTo, respondentId), эндпоинт respondent path
- **Story 6.2:** AnalyticsPageContent с Tabs, MetricsTab, React Query хуки useAnalytics.ts, apiClient
- **Story 6.3:** HeatmapView — нужно передавать filters для подсветки пути одного респондента

### Project Structure Notes
```
apps/web/src/
├── components/analytics/
│   ├── AnalyticsFilters.tsx          # НОВЫЙ — панель фильтров + badges
│   ├── RespondentsTab.tsx            # НОВЫЙ — вкладка "Респонденты" (таблица)
│   ├── RespondentPathView.tsx        # НОВЫЙ — drill-down путь респондента (timeline)
│   ├── MetricCards.tsx               # Существует (Story 6.2)
│   ├── NpsGauge.tsx                  # Существует (Story 6.2)
│   ├── AnswerDistribution.tsx        # Существует (Story 6.2)
│   ├── MetricsTab.tsx                # Существует (Story 6.2)
│   ├── HeatmapView.tsx              # Существует (Story 6.3), обновить — принимать filters
│   └── SatisfactionMatrix.tsx        # Существует (Story 6.3)
├── hooks/
│   └── useAnalytics.ts              # Обновить — filters в queryKey, добавить useRespondentPath
```

### References
- **FR42:** Фильтрация аналитики по дате, респонденту, ветке флоу
- **FR43:** Полный путь и ответы конкретного респондента
- **UX-DR16:** Tabs аналитики: Метрики | Heatmap | Респонденты
- **UX-DR17:** Пагинация — 10 элементов, "Показано X из Y" + кнопки навигации
- **UX-DR18:** Dropdown фильтры аналитики (дата, респондент, ветка), активные фильтры как badges, поиск с debounce 300ms

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
