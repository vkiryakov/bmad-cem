# Story 1.5: App shell — sidebar, layout, дашборд и базовые UI-паттерны

Status: review

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

- [x] Task 1: Установка shadcn/ui компонентов и шрифта (AC: #3)
  - [x] 1.1 Inter font через next/font/google
  - [x] 1.2 shadcn add card badge skeleton sonner
  - [x] 1.3 globals.css: slate палитра, Inter font
  - [x] 1.4 focus-visible: ring-2 ring-slate-400 ring-offset-2

- [x] Task 2: Sidebar компонент (AC: #1)
  - [x] 2.1-2.8 Sidebar.tsx: 240px, nav/Link, aria-current, lucide icons

- [x] Task 3: Admin layout (AC: #1)
  - [x] 3.1-3.3 layout.tsx: flex, Sidebar + main, semantic HTML

- [x] Task 4: EmptyState компонент (AC: #2)
  - [x] 4.1-4.6 EmptyState.tsx: generic, icon/title/desc/action

- [x] Task 5: Dashboard page (AC: #2)
  - [x] 5.1-5.4 EmptyState с ClipboardList и "Создать опрос"

- [x] Task 6: Кастомная пагинация (AC: #4)
  - [x] 6.1-6.7 Pagination.tsx: "Показано X из Y", навигация, aria-label

- [x] Task 7: Toast настройка (AC: #5)
  - [x] 7.1-7.5 Sonner Toaster, toast.ts: showSuccess/showError

- [x] Task 8: Skeleton компоненты (AC: #5)
  - [x] 8.1-8.3 TableSkeleton.tsx, CardSkeleton.tsx

- [x] Task 9: Breadcrumb компонент (AC: #6)
  - [x] 9.1-9.5 Breadcrumb.tsx: max 3, semantic nav/ol/li

- [x] Task 10: Глобальные стили и тема (AC: #3, #7)
  - [x] 10.1-10.4 bg-slate-50, text-slate-800, focus ring, light theme only

- [x] Task 11: Stub pages для навигации (AC: #1)
  - [x] 11.1-11.4 surveys, questions, analytics pages с EmptyState

- [x] Task 12: Верификация (AC: #1-7)
  - [x] 12.1-12.7 Sidebar, EmptyState, стили, semantic HTML
  - [x] 12.8 turbo build проходит (7 routes, 0 errors)

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
Claude Opus 4.6

### Debug Log References

### Completion Notes List
- Sidebar: 240px, 4 nav items (Дашборд, Опросы, Вопросы, Аналитика), lucide icons, active state
- EmptyState: generic component with icon/title/description/action
- Dashboard: EmptyState "У вас ещё нет опросов" + "Создать опрос" button
- Pagination: "Показано X из Y" + page navigation, max 5 visible pages
- Toast: Sonner integration, showSuccess (3s auto-hide), showError (manual close)
- Skeleton: TableSkeleton (5 rows), CardSkeleton (card with loading lines)
- Breadcrumb: max 3 levels, semantic nav/ol/li
- Globals: Inter font, slate-50 bg, slate-800 text, focus-visible ring
- Stub pages: surveys, questions, analytics with EmptyState
- Admin layout: Sidebar + main content, AuthGuard from Story 1.4
- Build: 7 routes, all compile successfully

### Change Log
- 2026-03-20: Story 1.5 — App shell, sidebar, EmptyState, UI patterns

### File List
- apps/web/src/app/layout.tsx (изменён — Inter font, Toaster)
- apps/web/src/app/globals.css (изменён — slate theme, focus ring)
- apps/web/src/app/(admin)/layout.tsx (изменён — Sidebar + main)
- apps/web/src/app/(admin)/dashboard/page.tsx (изменён — EmptyState)
- apps/web/src/app/(admin)/surveys/page.tsx (создан)
- apps/web/src/app/(admin)/questions/page.tsx (создан)
- apps/web/src/app/(admin)/analytics/page.tsx (создан)
- apps/web/src/components/layout/Sidebar.tsx (создан)
- apps/web/src/components/layout/EmptyState.tsx (создан)
- apps/web/src/components/layout/Pagination.tsx (создан)
- apps/web/src/components/layout/Breadcrumb.tsx (создан)
- apps/web/src/components/layout/TableSkeleton.tsx (создан)
- apps/web/src/components/layout/CardSkeleton.tsx (создан)
- apps/web/src/components/ui/card.tsx (создан shadcn)
- apps/web/src/components/ui/badge.tsx (создан shadcn)
- apps/web/src/components/ui/skeleton.tsx (создан shadcn)
- apps/web/src/components/ui/sonner.tsx (создан shadcn)
- apps/web/src/lib/toast.ts (создан)
