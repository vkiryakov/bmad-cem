# Story 1.5: App shell — sidebar, layout, дашборд и базовые UI-паттерны

Status: ready-for-dev

## Story

As a пользователь,
I want видеть удобную оболочку приложения с навигацией и пустым дашбордом после входа,
So that я могу ориентироваться в системе и начать работу.

## Acceptance Criteria

1. **Sidebar навигация и layout**
   - Given пользователь аутентифицирован
   - When открывает /dashboard
   - Then отображается sidebar слева (240px) с 4 пунктами: Дашборд, Опросы, Вопросы, Аналитика (UX-DR11)
   - And активный пункт выделен (bg-slate-100 text-slate-800 font-medium) (UX-DR16)
   - And основной контент занимает flex-1 с padding 24px

2. **Пустой дашборд (EmptyState)**
   - Given нет созданных опросов
   - When пользователь на /dashboard
   - Then отображается EmptyState: иконка + "У вас ещё нет опросов" + кнопка "Создать опрос" (FR46, UX-DR13)

3. **Визуальный стиль и тема**
   - Given приложение загружено
   - When проверяется визуальный стиль
   - Then фон страниц slate-50, поверхности white с shadow-sm (UX-DR9)
   - And шрифт Inter, заголовки semibold, body 14px (UX-DR10)
   - And кнопки Primary (slate-600, white text), Outline (border), Ghost/SM (compact) (UX-DR14)
   - And интерфейс использует светлую тему (FR48)

4. **Компонент пагинации**
   - Given компонент пагинации создан
   - When используется на странице со списком
   - Then отображает "Показано X из Y" слева + кнопки навигации справа
   - And 10 элементов на страницу, активная страница bg-slate-600 text-white (FR47, UX-DR17)

5. **Toast и skeleton**
   - Given приложение загружено
   - When проверяются паттерны обратной связи
   - Then toast-уведомления работают (зелёный success, auto-hide 3s) (UX-DR13)
   - And skeleton loading отображается при загрузке данных (UX-DR13)

6. **Breadcrumb**
   - Given пользователь находится на вложенной странице
   - When проверяется breadcrumb
   - Then отображается навигационная цепочка (max 3 уровня) (UX-DR16)

7. **Accessibility**
   - Given приложение загружено
   - When проверяется accessibility
   - Then semantic HTML используется (nav, main, section, button) (UX-DR19)
   - And visible focus ring на интерактивных элементах (ring-2 ring-slate-400 ring-offset-2)
   - And aria-label на иконочных кнопках

## Tasks / Subtasks

- [ ] Task 1: Установка shadcn/ui компонентов и шрифта (AC: #3)
  - [ ] 1.1 Установить шрифт Inter через next/font/google в root layout
  - [ ] 1.2 `npx shadcn@latest add button card badge toast skeleton` в apps/web
  - [ ] 1.3 Настроить globals.css: базовые цвета slate палитры, font-family Inter
  - [ ] 1.4 Настроить tailwind: ring-slate-400, focus-visible ring-2 ring-offset-2 глобально

- [ ] Task 2: Sidebar компонент (AC: #1)
  - [ ] 2.1 Создать `apps/web/src/components/layout/Sidebar.tsx`
  - [ ] 2.2 Фиксированная ширина 240px, высота 100vh, фон white, border-r border-slate-200
  - [ ] 2.3 Логотип/название "bmad-cem" сверху (h3, semibold, padding 24px)
  - [ ] 2.4 Навигация: 4 пункта с иконками — Дашборд (/dashboard), Опросы (/surveys), Вопросы (/questions), Аналитика (/analytics)
  - [ ] 2.5 Активный пункт: bg-slate-100 text-slate-800 font-medium, rounded-lg
  - [ ] 2.6 Неактивный пункт: text-slate-500 hover:bg-slate-50 hover:text-slate-700
  - [ ] 2.7 Использовать Next.js `usePathname()` для определения активного пункта
  - [ ] 2.8 Semantic HTML: `<nav>`, `<a>` или `<Link>` для пунктов, aria-current="page" на активном

- [ ] Task 3: Admin layout (AC: #1)
  - [ ] 3.1 Обновить `apps/web/src/app/(admin)/layout.tsx` — flex row: Sidebar (fixed 240px) + main content (flex-1)
  - [ ] 3.2 Main content: padding 24px, фон slate-50, min-height 100vh
  - [ ] 3.3 Semantic HTML: `<main>` для контентной области

- [ ] Task 4: EmptyState компонент (AC: #2)
  - [ ] 4.1 Создать `apps/web/src/components/layout/EmptyState.tsx` — props: icon (ReactNode), title (string), description (string), actionLabel (string), onAction (callback)
  - [ ] 4.2 Layout: flex col, items-center, gap-4, padding-8
  - [ ] 4.3 Иконка: 48x48, text-slate-300
  - [ ] 4.4 Заголовок: text-lg semibold text-slate-800
  - [ ] 4.5 Описание: text-sm text-slate-500
  - [ ] 4.6 Кнопка: Primary (slate-600, white text)

- [ ] Task 5: Dashboard page (AC: #2)
  - [ ] 5.1 Создать/обновить `apps/web/src/app/(admin)/dashboard/page.tsx`
  - [ ] 5.2 Заголовок страницы: "Дашборд" (h1, 24px, semibold)
  - [ ] 5.3 Контент: EmptyState с иконкой (ClipboardList или аналог), title "У вас ещё нет опросов", description "Создайте свой первый опрос, чтобы начать собирать обратную связь", actionLabel "Создать опрос", onAction → router.push('/surveys') (пока заглушка)
  - [ ] 5.4 В будущем (Epic 2+): заменится на grid SurveyCard при наличии опросов

- [ ] Task 6: Кастомная пагинация (AC: #4)
  - [ ] 6.1 Создать `apps/web/src/components/layout/Pagination.tsx` — props: page (number), totalPages (number), total (number), limit (number), onPageChange (callback)
  - [ ] 6.2 Левая часть: "Показано {from}-{to} из {total}"
  - [ ] 6.3 Правая часть: кнопки prev/next + номера страниц (max 5 видимых)
  - [ ] 6.4 Активная страница: bg-slate-600 text-white rounded
  - [ ] 6.5 Неактивная: text-slate-600 hover:bg-slate-100 rounded
  - [ ] 6.6 Disabled prev/next при крайних страницах: opacity-50 cursor-default
  - [ ] 6.7 Semantic: `<nav aria-label="Пагинация">`, кнопки с aria-label

- [ ] Task 7: Toast настройка (AC: #5)
  - [ ] 7.1 Установить и настроить Toaster (shadcn/ui toast) в root layout
  - [ ] 7.2 Создать helper `apps/web/src/lib/toast.ts` — функции showSuccess(message), showError(message)
  - [ ] 7.3 Success toast: зелёный (emerald), auto-hide 3 секунды
  - [ ] 7.4 Error toast: красный (rose), НЕ auto-hide (закрывается вручную)
  - [ ] 7.5 Позиция: top-right

- [ ] Task 8: Skeleton компоненты (AC: #5)
  - [ ] 8.1 Установить shadcn/ui skeleton (если не установлен в Task 1)
  - [ ] 8.2 Создать `apps/web/src/components/layout/TableSkeleton.tsx` — скелет таблицы (5 строк, 3 колонки)
  - [ ] 8.3 Создать `apps/web/src/components/layout/CardSkeleton.tsx` — скелет карточки (title + 2 строки текста)

- [ ] Task 9: Breadcrumb компонент (AC: #6)
  - [ ] 9.1 Создать `apps/web/src/components/layout/Breadcrumb.tsx` — props: items: { label: string; href?: string }[]
  - [ ] 9.2 Max 3 уровня, разделитель "/"
  - [ ] 9.3 Последний элемент: text-slate-800 font-medium (текущая страница, не ссылка)
  - [ ] 9.4 Промежуточные: text-slate-500, ссылки
  - [ ] 9.5 Semantic: `<nav aria-label="Breadcrumb">`, `<ol>`, `<li>`

- [ ] Task 10: Глобальные стили и тема (AC: #3, #7)
  - [ ] 10.1 Обновить globals.css: body фон slate-50, цвет текста slate-800
  - [ ] 10.2 Настроить focus-visible стили: ring-2 ring-slate-400 ring-offset-2 для интерактивных элементов
  - [ ] 10.3 Проверить что все кнопки, инпуты, ссылки имеют visible focus ring
  - [ ] 10.4 Убедиться что светлая тема — единственная (нет dark mode toggle)

- [ ] Task 11: Stub pages для навигации (AC: #1)
  - [ ] 11.1 Создать `apps/web/src/app/(admin)/surveys/page.tsx` — заглушка "Опросы" (h1 + EmptyState)
  - [ ] 11.2 Создать `apps/web/src/app/(admin)/questions/page.tsx` — заглушка "Вопросы" (h1 + EmptyState)
  - [ ] 11.3 Создать `apps/web/src/app/(admin)/analytics/page.tsx` — заглушка "Аналитика" (h1 + EmptyState)
  - [ ] 11.4 Все заглушки используют EmptyState с соответствующими сообщениями

- [ ] Task 12: Верификация (AC: #1-7)
  - [ ] 12.1 Логин → redirect на /dashboard → sidebar видна, активный пункт "Дашборд"
  - [ ] 12.2 Клик по пунктам sidebar → страницы меняются, активный пункт обновляется
  - [ ] 12.3 Dashboard показывает EmptyState с кнопкой "Создать опрос"
  - [ ] 12.4 Фон slate-50, карточки white с shadow-sm, шрифт Inter
  - [ ] 12.5 Toast: вызвать showSuccess → зелёный toast исчезает через 3 секунды
  - [ ] 12.6 Tab-навигация по sidebar и кнопкам → visible focus ring
  - [ ] 12.7 Проверить semantic HTML в DevTools: nav, main, button
  - [ ] 12.8 `turbo build` проходит без ошибок

## Dev Notes

### Критические технические требования

**Версии (март 2026):**
- Next.js: 16.2.0
- shadcn/cli: v4
- Tailwind CSS: v4 (включён в Next.js 16)

**shadcn/ui компоненты для установки:**
- button, card, badge, toast, skeleton — через `npx shadcn@latest add`
- Pagination — кастомный компонент (shadcn/ui pagination можно взять как базу и доработать под спецификацию)

### Архитектурные решения

**UX-DR9 — Цветовая система:**
- Background: slate-50 (#f8fafc)
- Surface: white (#ffffff) + shadow-sm
- Primary accent: slate-600 (#475569)
- Border: slate-200 (#e2e8f0)
- Success: emerald-500, Warning: amber-500, Error: rose-400, Info: sky-500

**UX-DR10 — Типографика:**
- Шрифт: Inter (через next/font/google)
- h1: 24px (text-2xl) semibold
- h2: 20px (text-xl) semibold
- h3: 16px (text-base) semibold
- body: 14px (text-sm) normal
- small: 12px (text-xs) normal
- Текст: primary slate-800, secondary slate-500, muted slate-400

**UX-DR11 — Layout админки:**
- Sidebar: 240px фиксированная слева, white фон, border-right slate-200
- Content: flex-1, padding 24px, фон slate-50
- Полная высота: min-h-screen

**UX-DR14 — Button hierarchy:**
- Primary: bg-slate-600 text-white hover:bg-slate-700. Одна на экран.
- Outline: border border-slate-300 text-slate-700 hover:bg-slate-50
- Ghost/SM: text-slate-600 hover:bg-slate-100, compact padding

**UX-DR16 — Sidebar navigation:**
- Активный: bg-slate-100 text-slate-800 font-medium
- Неактивный: text-slate-500 hover:bg-slate-50

**UX-DR17 — Pagination:**
- 10 элементов на страницу
- "Показано X из Y" слева
- Кнопки навигации справа
- Активная страница: bg-slate-600 text-white

**UX-DR19 — Accessibility:**
- Semantic HTML: nav, main, section, button
- Focus ring: ring-2 ring-slate-400 ring-offset-2
- aria-label на иконочных кнопках
- aria-current="page" на активном sidebar пункте

**Иконки:** Использовать lucide-react (поставляется с shadcn/ui). Примеры: LayoutDashboard, FileText, HelpCircle, BarChart3, ClipboardList.

**Sidebar — структура данных:**
```typescript
const navItems = [
  { label: 'Дашборд', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Опросы', href: '/surveys', icon: FileText },
  { label: 'Вопросы', href: '/questions', icon: HelpCircle },
  { label: 'Аналитика', href: '/analytics', icon: BarChart3 },
];
```

**EmptyState — переиспользуемый паттерн:**
Будет использоваться на всех страницах: дашборд (нет опросов), вопросы (нет вопросов), аналитика (нет данных). Поэтому компонент должен быть generic.

**Toast — реализация через shadcn/ui:**
shadcn/ui v4 использует Sonner или собственную реализацию. Проверить актуальную реализацию при установке. Ключевое: success (зелёный, 3s auto-hide), error (красный, не auto-hide).

### ЗАПРЕТЫ (anti-patterns)

- НЕ создавать SurveyCard, SurveyNode и другие domain-specific компоненты — это Epic 2+
- НЕ подключать React Query, Zustand, React Hook Form — это Epic 2+
- НЕ делать реальные API-запросы на dashboard — пока только EmptyState
- НЕ добавлять dark mode — FR48 требует светлую тему
- НЕ использовать спиннеры — только skeleton loading
- НЕ создавать collapsed sidebar — desktop-only, 240px всегда видна
- НЕ использовать div/span как кнопки — только button, a, Link
- НЕ использовать `any` type
- НЕ создавать responsive layout для админки — desktop-only (min 1024px)

### Previous Story Context

**Story 1.1:** Monorepo, apps/web (Next.js 16), shadcn/ui init, Tailwind CSS.

**Story 1.2:** packages/shared с enums и типами.

**Story 1.3:** Backend с глобальными паттернами, health endpoint.

**Story 1.4 создала:**
- Frontend: apiClient.ts (fetch wrapper с JWT)
- Frontend: useAuth.ts hook (isAuthenticated, login, logout)
- Frontend: /login page (форма логина)
- Frontend: (admin)/layout.tsx с AuthGuard (redirect на /login если нет токена)
- Backend: AuthModule (login + JWT), User entity, seed admin/123

**Эта история расширяет (admin)/layout.tsx:** добавляет Sidebar и main content wrapper. AuthGuard из Story 1.4 остаётся, обёрнутый sidebar layout.

### Project Structure Notes

**Новые/обновлённые файлы:**
```
apps/web/src/
├── app/
│   ├── layout.tsx                    # Обновить: Inter font, Toaster
│   ├── globals.css                   # Обновить: slate палитра, focus ring
│   └── (admin)/
│       ├── layout.tsx                # Обновить: Sidebar + main content wrapper
│       ├── dashboard/
│       │   └── page.tsx              # Обновить: EmptyState
│       ├── surveys/
│       │   └── page.tsx              # Новый: заглушка
│       ├── questions/
│       │   └── page.tsx              # Новый: заглушка
│       └── analytics/
│           └── page.tsx              # Новый: заглушка (создать директорию)
├── components/
│   ├── ui/                           # shadcn/ui (button, card, badge, toast, skeleton)
│   └── layout/
│       ├── Sidebar.tsx               # Новый
│       ├── Breadcrumb.tsx            # Новый
│       ├── EmptyState.tsx            # Новый
│       ├── Pagination.tsx            # Новый
│       ├── TableSkeleton.tsx         # Новый
│       └── CardSkeleton.tsx          # Новый
└── lib/
    └── toast.ts                      # Новый: showSuccess, showError helpers
```

### References

- [Source: planning-artifacts/ux-design-specification.md § Visual Design Foundation — Color System]
- [Source: planning-artifacts/ux-design-specification.md § Typography System]
- [Source: planning-artifacts/ux-design-specification.md § Spacing & Layout Foundation]
- [Source: planning-artifacts/ux-design-specification.md § UX Consistency Patterns — Button Hierarchy]
- [Source: planning-artifacts/ux-design-specification.md § Feedback Patterns]
- [Source: planning-artifacts/ux-design-specification.md § Navigation Patterns]
- [Source: planning-artifacts/ux-design-specification.md § Pagination Pattern]
- [Source: planning-artifacts/ux-design-specification.md § Accessibility Strategy]
- [Source: planning-artifacts/architecture.md § Frontend Structure]
- [Source: planning-artifacts/epics.md § Story 1.5: App shell — sidebar, layout, дашборд и базовые UI-паттерны]
- [Source: planning-artifacts/architecture.md § UX-DR9, UX-DR10, UX-DR11, UX-DR13, UX-DR14, UX-DR16, UX-DR17, UX-DR19]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
