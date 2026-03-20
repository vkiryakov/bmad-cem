# Story 2.2: Frontend — страница библиотеки вопросов

Status: ready-for-dev

## Story

As a пользователь,
I want видеть все свои вопросы в удобной таблице с фильтрацией и поиском,
So that я могу быстро найти нужный вопрос.

## Acceptance Criteria

1. **Given** пользователь аутентифицирован
   **When** открывает /questions
   **Then** отображается таблица вопросов с колонками: текст, тип (badge с цветом), дата создания
   **And** таблица загружается через React Query с skeleton loading

2. **Given** страница вопросов загружена
   **When** пользователь нажимает pill-кнопку типа (Все / NPS / Открытый / Закрытый / Матричный / Мульти-селект)
   **Then** таблица фильтруется по выбранному типу, одна кнопка активна (UX-DR18)

3. **Given** страница вопросов загружена
   **When** пользователь вводит текст в поле поиска
   **Then** таблица фильтруется с debounce 300ms без кнопки поиска (UX-DR18, FR6)

4. **Given** вопросов больше 10
   **When** страница отображается
   **Then** пагинация внизу: "Показано X из Y" + кнопки навигации (UX-DR17)

5. **Given** нет созданных вопросов
   **When** пользователь на /questions
   **Then** отображается EmptyState: "Начните с создания вопросов" + кнопка "Новый вопрос" (UX-DR13)

6. **Given** тип вопроса отображается как badge
   **When** проверяется визуальный стиль
   **Then** NPS — blue, открытый — emerald, закрытый — violet, матричный — amber, мульти-селект — pink (UX-DR9)

## Tasks / Subtasks

### API-клиент и хуки

- [ ] **T1** Создать API-функцию `fetchQuestions(params: {page?, limit?, questionType?, search?}): Promise<IPaginatedResponse<IQuestionResponseDto>>` в `apps/web/src/lib/apiClient.ts` или отдельном файле `apps/web/src/lib/api/questions.ts` [AC1]
- [ ] **T2** Создать хук `useQuestions(params)` в `apps/web/src/hooks/useQuestions.ts` — обёртка над `useQuery` из React Query. Query key: `['questions', params]`. Возвращает `{data, isLoading, error}` [AC1]

### Страница /questions

- [ ] **T3** Создать страницу `apps/web/src/app/(admin)/questions/page.tsx` — серверный компонент-обёртка, рендерит клиентский компонент `QuestionsPageContent` [AC1]
- [ ] **T4** Создать клиентский компонент `QuestionsPageContent` — управляет state: selectedType, searchQuery, page. Вызывает `useQuestions({questionType: selectedType, search: searchQuery, page, limit: 10})` [AC1-AC4]

### Компонент фильтров QuestionFilters

- [ ] **T5** Создать `apps/web/src/components/question/QuestionFilters.tsx` — отображает pill-кнопки фильтрации по типу вопроса [AC2]
- [ ] **T6** Pill-кнопки: "Все", "NPS", "Открытый", "Закрытый", "Матричный", "Мульти-селект". При нажатии обновляет выбранный тип, сбрасывает page на 1 [AC2]
- [ ] **T7** Активная pill-кнопка визуально выделена (bg-slate-600 text-white), неактивные — outline стиль [AC2]
- [ ] **T8** Поле поиска Input с placeholder "Поиск по тексту вопроса..." — onChange с debounce 300ms через useCallback + setTimeout (или useDebouncedValue хук). Сброс page на 1 при изменении поиска [AC3]

### Таблица вопросов

- [ ] **T9** Использовать shadcn/ui Table компонент для отображения списка вопросов. Колонки: Текст вопроса (основная, широкая), Тип (Badge), Дата создания (formatted) [AC1]
- [ ] **T10** Компонент `QuestionTypeBadge` — отображает тип вопроса как Badge с цветом по UX-DR9. Маппинг цветов: NPS -> bg-blue-100 text-blue-700, открытый -> bg-emerald-100 text-emerald-700, закрытый -> bg-violet-100 text-violet-700, матричный -> bg-amber-100 text-amber-700, мульти-селект -> bg-pink-100 text-pink-700 [AC6]
- [ ] **T11** Маппинг типов на русские названия для отображения: nps -> "NPS", open -> "Открытый", closed -> "Закрытый", matrix -> "Матричный", multi_select -> "Мульти-селект" [AC6]
- [ ] **T12** Каждая строка таблицы отображает кнопки действий (редактирование, удаление) — подготовка для Story 2.3. Кнопки disabled если hasResponses === true [AC1]

### Skeleton loading

- [ ] **T13** Создать skeleton-состояние для таблицы — использовать shadcn/ui Skeleton компонент: 5 строк-скелетонов с формой колонок таблицы. Показывается при `isLoading === true` [AC1]

### Пагинация

- [ ] **T14** Использовать shadcn/ui Pagination компонент (или кастомный, если из Story 1.5). Отображает "Показано X из Y" слева и кнопки навигации справа [AC4]
- [ ] **T15** 10 элементов на страницу, активная страница bg-slate-600 text-white. Переключение страницы обновляет query param page и вызывает refetch [AC4]

### Empty State

- [ ] **T16** При `data.length === 0` и отсутствии фильтров/поиска — отображать EmptyState компонент (из Story 1.5 или создать). Иконка + заголовок "Начните с создания вопросов" + описание "Создайте вопросы для использования в опросах" + кнопка "Новый вопрос" (Primary) [AC5]
- [ ] **T17** При `data.length === 0` и активных фильтрах/поиске — отображать "Ничего не найдено" (другой вариант empty state) [AC5]

### Accessibility и UX

- [ ] **T18** Semantic HTML: `<main>`, `<table>`, `<thead>`, `<tbody>`, `<th scope="col">` [AC1]
- [ ] **T19** aria-label на pill-кнопках фильтров, aria-current на активной pill-кнопке [AC2]
- [ ] **T20** Visible focus ring (ring-2 ring-slate-400 ring-offset-2) на интерактивных элементах [AC1]

## Dev Notes

### Критические технические требования

- **Next.js 16.2.0**, **React Query (TanStack Query)**, **shadcn/cli v4**
- Компоненты shadcn/ui: Table, Input, Badge, Pagination, Skeleton, Button
- Debounce на поиске: 300ms, без внешних библиотек (useCallback + setTimeout или кастомный хук)
- Все данные загружаются с API через React Query — никаких fetch в useEffect

### Архитектурные решения

- **React Query** для серверного state. Query key включает все параметры запроса: `['questions', {questionType, search, page, limit}]`. При изменении параметров автоматический refetch.
- **Клиентский компонент** для интерактивной страницы (фильтры, поиск, пагинация). Next.js page.tsx может быть server component обёрткой.
- **Цветовая система типов вопросов** (UX-DR9) — вынести маппинг QuestionType -> {bgColor, textColor, label} в утилиту `apps/web/src/lib/questionTypeConfig.ts` для переиспользования в Story 2.3 и Epic 3.
- **URL state** — опционально синхронизировать фильтры/поиск/page с URL query params через `useSearchParams` для сохранения state при навигации. Минимальная реализация: React state.
- **Формат даты** — отображать createdAt как "DD.MM.YYYY" или relative ("2 дня назад"). Использовать `Intl.DateTimeFormat('ru-RU')`.

### ЗАПРЕТЫ (anti-patterns)

- НЕ использовать fetch/axios в компонентах напрямую — только через React Query хуки
- НЕ использовать useEffect для загрузки данных — только useQuery
- НЕ мутировать props или state напрямую
- НЕ хардкодить цвета типов в компоненте — вынести в конфигурацию
- НЕ создавать формы создания/редактирования вопросов — это scope Story 2.3
- НЕ реализовывать логику удаления — это scope Story 2.3
- НЕ использовать спиннеры — только skeleton loading (UX-DR13)
- НЕ использовать `any` тип

### Previous Story Context

- **Story 1.5** создала app shell: sidebar с 4 пунктами (Дашборд, Опросы, Вопросы, Аналитика), admin layout с padding 24px, EmptyState компонент, Pagination компонент, toast, skeleton loading patterns
- **Story 2.1** создала backend API: GET /api/v1/questions с query params (page, limit, questionType, search), возвращает `{data: IQuestionResponseDto[], meta: {page, limit, total, totalPages}}`
- `apiClient.ts` уже настроен с JWT-авторизацией (из Story 1.4)
- `queryClient.ts` уже настроен (из Story 1.5)
- Типы `IQuestionResponseDto`, `QuestionType`, `IPaginatedResponse` доступны из `@bmad-cem/shared`

### Project Structure Notes

```
apps/web/src/
├── app/(admin)/questions/
│   └── page.tsx                          # Страница библиотеки вопросов
├── components/question/
│   ├── QuestionFilters.tsx               # Pill-фильтры по типу + поле поиска
│   └── (QuestionForm.tsx — Story 2.3)
├── hooks/
│   └── useQuestions.ts                   # React Query хук для вопросов
├── lib/
│   ├── apiClient.ts                      # Уже существует
│   ├── api/questions.ts                  # API-функции для вопросов (опционально)
│   └── questionTypeConfig.ts             # Маппинг типов -> цвета, лейблы
└── types/
    └── index.ts
```

### References

- PRD: FR2 (просмотр списка с фильтрацией), FR6 (поиск по тексту)
- UX Design: UX-DR9 (цвета типов), UX-DR13 (skeleton, empty states, toast), UX-DR17 (пагинация), UX-DR18 (pill-фильтры, debounce поиск)
- Architecture: React Query для server state, shadcn/ui компоненты
- Architecture: Frontend Structure (components/question/, hooks/)

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
