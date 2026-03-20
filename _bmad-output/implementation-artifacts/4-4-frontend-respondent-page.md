# Story 4.4: Frontend — страница респондентов опроса

Status: ready-for-dev

## Story

As a пользователь,
I want добавлять респондентов и отслеживать их статусы,
So that я могу управлять рассылкой и видеть прогресс сбора ответов.

## Acceptance Criteria

1. **Таблица респондентов с пагинацией и поиском**
   - Given пользователь на /surveys/[id]/respondents
   - When страница загружается
   - Then отображается таблица респондентов: email, статус (badge), дата добавления (FR27)
   - And пагинация и поиск по email

2. **Добавление одного респондента**
   - Given опрос в статусе active
   - When пользователь вводит email и нажимает "Добавить"
   - Then респондент создаётся через API, таблица обновляется (FR24)
   - And toast "Респондент добавлен"

3. **Batch-добавление через запятую**
   - Given поле ввода email
   - When пользователь вводит несколько email через запятую ("a@b.com, c@d.com")
   - Then все респонденты добавляются batch (UX-DR15)

4. **Дедупликация — inline ошибка**
   - Given email уже добавлен в этот опрос
   - When пользователь пытается добавить тот же email
   - Then inline-ошибка "Этот email уже добавлен" под полем (FR26, UX-DR15)

5. **Валидация email**
   - Given невалидный формат email
   - When пользователь нажимает "Добавить"
   - Then inline-ошибка "Некорректный email" под полем

6. **Копирование персональной ссылки**
   - Given респондент в таблице
   - When пользователь нажимает кнопку копирования ссылки
   - Then персональная ссылка копируется в буфер обмена
   - And toast "Ссылка скопирована"

7. **Badge статусов респондентов**
   - Given статусы респондентов
   - When отображаются в таблице
   - Then not_opened: серый badge, opened: синий, in_progress: amber, completed: зелёный (FR28)

8. **Скрытие формы для неактивных опросов**
   - Given опрос не в статусе active
   - When пользователь на странице респондентов
   - Then форма добавления респондентов скрыта или disabled

## Tasks / Subtasks

- [ ] Task 1: Создать React Query hooks для респондентов (AC: #1, #2, #3)
  - [ ] 1.1 Создать apps/web/src/hooks/useRespondents.ts
  - [ ] 1.2 useQuery для GET /api/v1/surveys/:surveyId/respondents с page, limit, search
  - [ ] 1.3 useMutation для POST /api/v1/surveys/:surveyId/respondents (single email)
  - [ ] 1.4 useMutation для POST /api/v1/surveys/:surveyId/respondents (batch emails)
  - [ ] 1.5 Invalidation queryKey: ['respondents', surveyId] при успешном добавлении
  - [ ] 1.6 Toast на success: "Респондент добавлен" / "Респонденты добавлены (N)"
  - [ ] 1.7 Обработка ошибки 409 RESPONDENT_ALREADY_EXISTS — возврат ошибки для inline отображения

- [ ] Task 2: Создать компонент AddRespondentForm (AC: #2, #3, #4, #5, #8)
  - [ ] 2.1 Поле Input для email + кнопка "Добавить" (UX-DR15)
  - [ ] 2.2 React Hook Form для валидации: email формат проверка (regex или @IsEmail-like)
  - [ ] 2.3 Парсинг batch-ввода: split по запятой, trim каждый email, валидация каждого
  - [ ] 2.4 Inline ошибка под полем (rose-400 border) для невалидного email (AC: #5)
  - [ ] 2.5 Inline ошибка "Этот email уже добавлен" при 409 от API (AC: #4)
  - [ ] 2.6 Disabled state: кнопка disabled при пустом поле или submitting
  - [ ] 2.7 Очистка поля после успешного добавления
  - [ ] 2.8 Компонент скрыт/disabled если survey.status !== 'active' (AC: #8)

- [ ] Task 3: Создать компонент RespondentStatusBadge (AC: #7)
  - [ ] 3.1 Badge с цветами по статусу респондента
  - [ ] 3.2 not_opened: bg-slate-100 text-slate-500 ("Не открыл")
  - [ ] 3.3 opened: bg-sky-100 text-sky-700 ("Открыл")
  - [ ] 3.4 in_progress: bg-amber-100 text-amber-700 ("В процессе")
  - [ ] 3.5 completed: bg-emerald-100 text-emerald-700 ("Завершил")

- [ ] Task 4: Создать компонент RespondentTable (AC: #1, #6, #7)
  - [ ] 4.1 Таблица (shadcn/ui Table): колонки — Email, Статус, Дата добавления, Действия
  - [ ] 4.2 Колонка Email: текст email
  - [ ] 4.3 Колонка Статус: RespondentStatusBadge
  - [ ] 4.4 Колонка Дата: форматированная дата (DD.MM.YYYY)
  - [ ] 4.5 Колонка Действия: кнопка копирования ссылки (Ghost/SM кнопка с иконкой copy)
  - [ ] 4.6 Skeleton loading при загрузке данных (5-6 строк skeleton)

- [ ] Task 5: Копирование ссылки в буфер обмена (AC: #6)
  - [ ] 5.1 Использовать navigator.clipboard.writeText(link)
  - [ ] 5.2 Формат ссылки: link из API response (уже содержит полный URL)
  - [ ] 5.3 Toast "Ссылка скопирована" на 3 секунды
  - [ ] 5.4 Иконка кнопки: Copy icon (Lucide React)
  - [ ] 5.5 Fallback для старых браузеров: document.execCommand('copy')

- [ ] Task 6: Страница /surveys/[id]/respondents (AC: #1, #8)
  - [ ] 6.1 Расширить apps/web/src/app/(admin)/surveys/[id]/respondents/page.tsx
  - [ ] 6.2 Загрузить данные опроса (для проверки статуса) + респондентов
  - [ ] 6.3 Breadcrumb: Опросы → [Название опроса] → Респонденты
  - [ ] 6.4 Заголовок страницы: h1 "Респонденты" + badge статуса опроса
  - [ ] 6.5 AddRespondentForm сверху (если active)
  - [ ] 6.6 Поле поиска по email с debounce 300ms
  - [ ] 6.7 RespondentTable с данными
  - [ ] 6.8 Пагинация внизу: "Показано X из Y" + кнопки навигации (UX-DR17)
  - [ ] 6.9 EmptyState если нет респондентов: "Добавьте респондентов для рассылки опроса"

- [ ] Task 7: Debounce для поиска (AC: #1)
  - [ ] 7.1 useState для searchTerm + debouncedSearch (300ms)
  - [ ] 7.2 debouncedSearch как параметр search в useQuery

## Dev Notes

### Критические технические требования

**Версии пакетов:**
- Next.js: 16.2.0
- shadcn/ui v4 (Table, Input, Button, Badge, Pagination, Skeleton)
- React Query (TanStack Query) для server state
- React Hook Form для формы добавления (AR16)
- Lucide React для иконок (Copy, Plus)

**Цвета Badge статусов респондентов (из epics.md AC):**
```typescript
const respondentStatusColors: Record<RespondentStatus, string> = {
  not_opened: 'bg-slate-100 text-slate-500',
  opened: 'bg-sky-100 text-sky-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

const respondentStatusLabels: Record<RespondentStatus, string> = {
  not_opened: 'Не открыл',
  opened: 'Открыл',
  in_progress: 'В процессе',
  completed: 'Завершил',
};
```

**Email валидация (frontend):**
```typescript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Парсинг batch-ввода
const parseEmails = (input: string): string[] =>
  input.split(',').map(e => e.trim()).filter(e => e.length > 0);
```

**Копирование в буфер:**
```typescript
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Ссылка скопирована');
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    toast.success('Ссылка скопирована');
  }
};
```

### Архитектурные решения

**React Query для server state (AR15):**
```typescript
// hooks/useRespondents.ts
const useRespondents = (surveyId: number, page: number, limit: number, search?: string) =>
  useQuery({
    queryKey: ['respondents', surveyId, { page, limit, search }],
    queryFn: () => apiClient.get(`/api/v1/surveys/${surveyId}/respondents`, {
      params: { page, limit, search },
    }),
  });

const useAddRespondent = (surveyId: number) =>
  useMutation({
    mutationFn: (data: { email?: string; emails?: string[] }) =>
      apiClient.post(`/api/v1/surveys/${surveyId}/respondents`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['respondents', surveyId] });
    },
  });
```

**React Hook Form для формы (AR16):**
```typescript
const { register, handleSubmit, setError, reset, formState: { errors } } = useForm<{ emailInput: string }>();

const onSubmit = async (data: { emailInput: string }) => {
  const emails = parseEmails(data.emailInput);
  // валидация каждого email
  // вызов mutation (single или batch)
  // при ошибке 409 → setError('emailInput', { message: 'Этот email уже добавлен' })
};
```

**Обработка ошибки дедупликации:**
```typescript
// В onError mutation:
if (error.response?.data?.errorCode === 'RESPONDENT_ALREADY_EXISTS') {
  setError('emailInput', { message: 'Этот email уже добавлен' });
} else {
  toast.error(error.response?.data?.message || 'Ошибка при добавлении');
}
```

### ЗАПРЕТЫ (anti-patterns)

- НЕ реализовывать публичную страницу прохождения опроса — это Epic 5
- НЕ реализовывать удаление респондентов — не указано в AC
- НЕ хранить список респондентов в Zustand — React Query управляет server state
- НЕ делать клиентскую фильтрацию — поиск через API query param
- НЕ показывать ссылку целиком в таблице — только кнопка копирования
- НЕ отправлять email (рассылку) — система только генерирует ссылки, рассылка ручная
- НЕ реализовывать real-time обновление статусов — polling или ручной refresh
- НЕ использовать window.alert() или window.prompt() — только shadcn/ui компоненты
- НЕ использовать `any` type

### Previous Story Context

- **Epic 1 (Story 1.5):** App shell — sidebar, admin layout, Breadcrumb, Pagination, toast, skeleton, EmptyState
- **Epic 3 (Stories 3.1-3.4):** Страница /surveys/[id] существует, apiClient настроен с JWT, useSurveys hook
- **Story 4.1:** Backend lifecycle готов, Survey имеет status
- **Story 4.2:** Backend RespondentModule готов — POST для добавления (single + batch), GET для списка с пагинацией/поиском, token + link в ответе
- **Story 4.3:** Страница /surveys обновлена с SurveyCard, lifecycle кнопками

**Эта история создаёт страницу /surveys/[id]/respondents** — таблица + форма добавления + копирование ссылок.

### Project Structure Notes

**Новые файлы:**
```
apps/web/src/hooks/useRespondents.ts                              # НОВЫЙ: React Query hooks
apps/web/src/app/(admin)/surveys/[id]/respondents/page.tsx        # НОВЫЙ или расширить
```

**Файлы для модификации:**
```
apps/web/src/components/survey/   # Можно добавить RespondentStatusBadge, AddRespondentForm, RespondentTable сюда или в отдельную папку
```

**Структура компонентов (рекомендация):**
```
apps/web/src/components/
├── survey/
│   └── SurveyCard.tsx           # Из Story 4.3
├── respondent/                  # НОВАЯ папка (или разместить в survey/)
│   ├── AddRespondentForm.tsx
│   ├── RespondentTable.tsx
│   └── RespondentStatusBadge.tsx
```

**shadcn/ui компоненты (убедиться что установлены):**
```bash
npx shadcn@latest add table input badge skeleton
```

### References

- [Source: planning-artifacts/epics.md § Story 4.4: Frontend — страница респондентов опроса]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR15: Form patterns — ввод респондентов, batch через запятую]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR17: Pagination]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR18: Search & Filter — debounce 300ms]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR13: Паттерны обратной связи — toast, inline errors, skeleton, empty states]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR14: Button hierarchy — Ghost/SM для таблиц]
- [Source: planning-artifacts/architecture.md § Frontend Architecture — React Query, React Hook Form]
- [Source: planning-artifacts/architecture.md § Frontend Structure — respondents/page.tsx]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
