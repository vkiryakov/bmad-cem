# Story 4.3: Frontend — список опросов, lifecycle и SurveyCard

Status: ready-for-dev

## Story

As a пользователь,
I want видеть все опросы как карточки с возможностью управления их статусом,
So that я могу быстро оценить состояние и управлять каждым опросом.

## Acceptance Criteria

1. **Отображение SurveyCard в grid-layout**
   - Given пользователь аутентифицирован
   - When открывает /surveys
   - Then отображаются SurveyCard в grid-layout: название + дата + кол-во вопросов + badge статуса (UX-DR5)
   - And при наличии респондентов показывается мини-статистика (респонденты, завершили)

2. **Badge статусов с цветовым кодированием**
   - Given SurveyCard отображается
   - When проверяются badge статусов
   - Then Draft: slate-100/slate-600, Active: emerald-100/emerald-700, Completed: sky-100/sky-700, Archived: slate-100/slate-400 (UX-DR9)

3. **Hover и навигация Draft-опроса**
   - Given SurveyCard для Draft-опроса
   - When пользователь наводит курсор
   - Then shadow увеличивается (hover state) (UX-DR5)
   - And клик ведёт на /surveys/[id]/builder (UX-DR16)

4. **Навигация Active/Completed-опроса**
   - Given SurveyCard для Active/Completed-опроса
   - When пользователь кликает
   - Then ведёт на /surveys/[id]/analytics (UX-DR16)

5. **Активация Draft-опроса**
   - Given опрос в статусе draft
   - When пользователь нажимает "Активировать"
   - Then confirm dialog: "Опрос будет запущен. Респонденты смогут проходить его."
   - And при подтверждении вызывается API activate, карточка обновляется (FR18)

6. **Завершение Active-опроса**
   - Given опрос в статусе active
   - When пользователь нажимает "Завершить"
   - Then confirm dialog с предупреждением, при подтверждении — API complete (FR19)

7. **Архивация Completed-опроса**
   - Given опрос в статусе completed
   - When пользователь нажимает "Архивировать"
   - Then confirm dialog, при подтверждении — API archive (FR20)

8. **Поиск по названию**
   - Given страница опросов
   - When пользователь вводит текст в поле поиска
   - Then карточки фильтруются по названию с debounce 300ms (FR23)

## Tasks / Subtasks

- [ ] Task 1: Создать компонент SurveyCard (AC: #1, #2, #3, #4)
  - [ ] 1.1 Создать apps/web/src/components/survey/SurveyCard.tsx
  - [ ] 1.2 Контент карточки: название (h3, truncate), дата создания (small, slate-500), кол-во вопросов (small), Badge статуса
  - [ ] 1.3 Мини-статистика footer: кол-во респондентов, кол-во завершивших, NPS (если есть данные)
  - [ ] 1.4 Hover state: shadow-sm → shadow-md transition (UX-DR5)
  - [ ] 1.5 Cursor: pointer, onClick → навигация (router.push)

- [ ] Task 2: Создать компонент StatusBadge (AC: #2)
  - [ ] 2.1 Реиспользуемый Badge с цветами по статусу
  - [ ] 2.2 Draft: bg-slate-100 text-slate-600
  - [ ] 2.3 Active: bg-emerald-100 text-emerald-700
  - [ ] 2.4 Completed: bg-sky-100 text-sky-700
  - [ ] 2.5 Archived: bg-slate-100 text-slate-400

- [ ] Task 3: Навигация по клику на карточку (AC: #3, #4)
  - [ ] 3.1 Draft → router.push(`/surveys/${id}/builder`)
  - [ ] 3.2 Active, Completed → router.push(`/surveys/${id}/analytics`)
  - [ ] 3.3 Archived → router.push(`/surveys/${id}/analytics`) (read-only)

- [ ] Task 4: Lifecycle action кнопки на SurveyCard (AC: #5, #6, #7)
  - [ ] 4.1 Draft: кнопка "Активировать" (Primary/outline)
  - [ ] 4.2 Active: кнопка "Завершить" (outline, деструктивная стилистика)
  - [ ] 4.3 Completed: кнопка "Архивировать" (outline)
  - [ ] 4.4 Archived: нет action-кнопок
  - [ ] 4.5 Кнопка event.stopPropagation() — клик по кнопке не должен навигировать на страницу

- [ ] Task 5: Confirm Dialog для lifecycle-действий (AC: #5, #6, #7)
  - [ ] 5.1 Использовать shadcn/ui AlertDialog (не Dialog)
  - [ ] 5.2 Активация: title "Активировать опрос?", description "Опрос будет запущен. Респонденты смогут проходить его. Отменить активацию нельзя."
  - [ ] 5.3 Завершение: title "Завершить опрос?", description "Респонденты больше не смогут проходить опрос. Это действие необратимо."
  - [ ] 5.4 Архивация: title "Архивировать опрос?", description "Опрос будет перемещён в архив."
  - [ ] 5.5 Кнопка подтверждения: loading state при вызове API

- [ ] Task 6: React Query hooks для surveys (AC: #1, #5, #6, #7, #8)
  - [ ] 6.1 Создать/расширить apps/web/src/hooks/useSurveys.ts
  - [ ] 6.2 useQuery для GET /api/v1/surveys с page, limit, search
  - [ ] 6.3 useMutation для POST /api/v1/surveys/:id/activate — invalidation queryKey: ['surveys']
  - [ ] 6.4 useMutation для POST /api/v1/surveys/:id/complete — invalidation
  - [ ] 6.5 useMutation для POST /api/v1/surveys/:id/archive — invalidation
  - [ ] 6.6 Toast на success: "Опрос активирован" / "Опрос завершён" / "Опрос архивирован"
  - [ ] 6.7 Toast на error: отображение message из API-ответа

- [ ] Task 7: Страница /surveys — grid layout + поиск (AC: #1, #8)
  - [ ] 7.1 Расширить apps/web/src/app/(admin)/surveys/page.tsx
  - [ ] 7.2 Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
  - [ ] 7.3 Поле поиска сверху с debounce 300ms (UX-DR18)
  - [ ] 7.4 Пагинация внизу: "Показано X из Y" + кнопки навигации (UX-DR17)
  - [ ] 7.5 Skeleton loading: grid из 6 skeleton-карточек при загрузке
  - [ ] 7.6 EmptyState если нет опросов: "У вас ещё нет опросов" + кнопка "Создать опрос" (UX-DR13)

- [ ] Task 8: Debounce для поиска (AC: #8)
  - [ ] 8.1 useState для searchTerm (immediate) + debouncedSearch (debounced 300ms)
  - [ ] 8.2 debouncedSearch передаётся в useQuery как параметр search
  - [ ] 8.3 Можно использовать useDebouncedValue custom hook или lodash.debounce

## Dev Notes

### Критические технические требования

**Версии пакетов:**
- Next.js: 16.2.0
- shadcn/ui v4 (Button, Card, Badge, AlertDialog, Input, Skeleton, Pagination)
- React Query (TanStack Query) для server state
- Next.js App Router (useRouter, useSearchParams)

**SurveyCard — анатомия компонента (UX-DR5):**
```
┌──────────────────────────────┐
│ [Название опроса]    [Badge] │  ← header
│ 20 марта 2026 · 8 вопросов  │  ← meta
│──────────────────────────────│
│ 👥 24 респондента            │  ← мини-статистика (если есть)
│ ✅ 18 завершили              │
│──────────────────────────────│
│         [Активировать]       │  ← action button (зависит от статуса)
└──────────────────────────────┘
```

**Цвета Badge статусов (UX-DR9):**
```typescript
const statusColors: Record<SurveyStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-sky-100 text-sky-700',
  archived: 'bg-slate-100 text-slate-400',
};
```

**Русские метки статусов:**
```typescript
const statusLabels: Record<SurveyStatus, string> = {
  draft: 'Черновик',
  active: 'Активен',
  completed: 'Завершён',
  archived: 'Архив',
};
```

### Архитектурные решения

**React Query для server state (AR15):**
```typescript
// hooks/useSurveys.ts
const useSurveys = (page: number, limit: number, search?: string) =>
  useQuery({
    queryKey: ['surveys', { page, limit, search }],
    queryFn: () => apiClient.get('/api/v1/surveys', { params: { page, limit, search } }),
  });

const useActivateSurvey = () =>
  useMutation({
    mutationFn: (id: number) => apiClient.post(`/api/v1/surveys/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Опрос активирован');
    },
  });
```

**Навигация по статусу (UX-DR16):**
```typescript
const handleCardClick = (survey: ISurveyResponseDto) => {
  if (survey.status === SurveyStatus.DRAFT) {
    router.push(`/surveys/${survey.id}/builder`);
  } else {
    router.push(`/surveys/${survey.id}/analytics`);
  }
};
```

**AlertDialog (shadcn/ui) для confirm:**
- Не обычный Dialog — AlertDialog блокирует фокус и имеет семантику подтверждения
- AlertDialogTrigger оборачивает action-кнопку
- AlertDialogAction вызывает mutation

### ЗАПРЕТЫ (anti-patterns)

- НЕ создавать страницу конструктора или аналитики — это Epic 3 и Epic 6
- НЕ реализовывать создание нового опроса — это Epic 3 (Story 3.1)
- НЕ реализовывать страницу респондентов — это Story 4.4
- НЕ использовать window.confirm() — только shadcn/ui AlertDialog
- НЕ вызывать API напрямую из компонентов — только через React Query hooks
- НЕ хранить список опросов в Zustand — React Query управляет server state
- НЕ мутировать state напрямую — React Query invalidation для обновления данных
- НЕ делать клиентскую фильтрацию — поиск через API query param (серверная фильтрация)
- НЕ использовать `any` type

### Previous Story Context

- **Epic 1 (Story 1.5):** App shell готов — sidebar навигация, admin layout, EmptyState компонент, Pagination компонент, toast, skeleton loading
- **Epic 3 (Stories 3.1-3.4):** Страница /surveys существует (базовый список), SurveyModule API с CRUD, apiClient настроен с JWT
- **Story 4.1:** Backend lifecycle-эндпоинты готовы (POST activate/complete/archive), GET /surveys с search и пагинацией

**Эта история расширяет существующую страницу /surveys** — переделывает из таблицы/списка в grid карточек SurveyCard, добавляет lifecycle-кнопки.

### Project Structure Notes

**Новые файлы:**
```
apps/web/src/components/survey/SurveyCard.tsx    # НОВЫЙ: компонент карточки опроса
```

**Файлы для модификации:**
```
apps/web/src/app/(admin)/surveys/page.tsx        # Расширить: grid layout, поиск, пагинация
apps/web/src/hooks/useSurveys.ts                 # Расширить: lifecycle mutations, search params
```

**shadcn/ui компоненты (убедиться что установлены):**
```bash
npx shadcn@latest add card badge alert-dialog input skeleton
```

### References

- [Source: planning-artifacts/epics.md § Story 4.3: Frontend — список опросов, lifecycle и SurveyCard]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR5: SurveyCard]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR9: Цвета статусов опроса (Badge)]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR16: Navigation — клик по статусу]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR17: Pagination]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR18: Search & Filter — debounce 300ms]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR13: Паттерны обратной связи — empty states, skeleton]
- [Source: planning-artifacts/architecture.md § Frontend Architecture — React Query, Zustand]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
