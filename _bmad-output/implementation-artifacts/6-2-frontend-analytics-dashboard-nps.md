# Story 6.2: Frontend — дашборд аналитики и NPS

Status: ready-for-dev

## Story

As a пользователь,
I want видеть ключевые метрики и распределение ответов по опросу,
So that я могу быстро оценить результаты и уровень удовлетворённости клиентов.

## Acceptance Criteria

1. **Given** пользователь на /surveys/[id]/analytics
   **When** вкладка "Метрики" активна (по умолчанию)
   **Then** отображаются карточки метрик (Card, grid 3 колонки): респонденты, завершили, completion rate (FR38)
   **And** данные загружаются через React Query с skeleton loading

2. **Given** вкладка "Метрики"
   **When** отображается NPS секция
   **Then** NpsGauge показывает: крупное число NPS (-100..+100) слева + stacked bar (detractor красный / passive жёлтый / promoter зелёный) справа + проценты (UX-DR7)

3. **Given** вкладка "Метрики"
   **When** отображается распределение ответов
   **Then** для каждого вопроса показывается Recharts bar chart или pie chart (FR39)
   **And** NPS: bar chart по оценкам 0-10
   **And** закрытый/мульти-селект: bar chart по вариантам
   **And** открытый: список текстовых ответов

4. **Given** опрос без ответов
   **When** вкладка "Метрики"
   **Then** EmptyState: "Ожидание ответов" с пояснением (UX-DR13)

5. **Given** вкладки аналитики
   **When** пользователь переключает
   **Then** три вкладки: Метрики | Heatmap | Респонденты (UX-DR16, Tabs shadcn/ui)

## Tasks / Subtasks

### Страница аналитики и роутинг
- [ ] Создать/обновить `apps/web/src/app/(admin)/surveys/[id]/analytics/page.tsx` — серверный компонент, загружает surveyId из params [AC 1, 5]
- [ ] Создать клиентский компонент `AnalyticsPageContent.tsx` внутри `apps/web/src/components/analytics/` — содержит Tabs и логику переключения [AC 5]
- [ ] Реализовать Tabs (shadcn/ui) с тремя вкладками: "Метрики" (default), "Heatmap", "Респонденты" [AC 5]
- [ ] Breadcrumb: Опросы -> {название опроса} -> Аналитика [AC 1]

### React Query хуки
- [ ] Создать/обновить `apps/web/src/hooks/useAnalytics.ts` [AC 1-3]:
  - `useAnalyticsSummary(surveyId, filters)` — GET /api/v1/surveys/:id/analytics/summary
  - `useAnalyticsDistribution(surveyId, filters)` — GET /api/v1/surveys/:id/analytics/distribution
- [ ] Настроить staleTime: 30 секунд (данные аналитики меняются не мгновенно) [AC 1]
- [ ] Передать filters из URL query params или из Zustand/state [AC 1]

### MetricCards компонент
- [ ] Создать `apps/web/src/components/analytics/MetricCards.tsx` [AC 1]:
  - Grid 3 колонки (CSS grid, gap-4)
  - Карточка 1: "Респонденты" — totalRespondents (число + иконка Users)
  - Карточка 2: "Завершили" — completedRespondents (число + иконка CheckCircle)
  - Карточка 3: "Completion Rate" — completionRate (процент + иконка TrendingUp)
  - Использовать shadcn/ui Card
  - Skeleton loading: три Card с Skeleton-блоками внутри при isPending

### NpsGauge компонент
- [ ] Создать `apps/web/src/components/analytics/NpsGauge.tsx` [AC 2]:
  - Левая часть: крупное число NPS (text-4xl font-bold), цвет зависит от значения (красный < 0, жёлтый 0-50, зелёный > 50)
  - Правая часть: stacked horizontal bar (div с тремя сегментами)
    - Detractors: bg-rose-400, ширина = detractorPercent%
    - Passives: bg-amber-400, ширина = passivePercent%
    - Promoters: bg-emerald-400, ширина = promoterPercent%
  - Под баром: подписи с процентами для каждого сегмента
  - Использовать shadcn/ui Card как обёртка
  - Skeleton loading при загрузке

### AnswerDistribution компонент
- [ ] Создать `apps/web/src/components/analytics/AnswerDistribution.tsx` [AC 3]:
  - Принимает массив вопросов с их распределениями
  - Для каждого вопроса — секция с заголовком (текст вопроса) + Chart
  - NPS-вопросы: Recharts BarChart, ось X = оценки 0-10, ось Y = количество ответов, цвета: 0-6 rose-400, 7-8 amber-400, 9-10 emerald-400
  - Закрытый/мульти-селект: Recharts BarChart горизонтальный, бары = варианты, цвет slate-500
  - Открытый: список текстовых ответов в Card (без графика), truncate длинных ответов с expand
  - Recharts: responsive container (ResponsiveContainer width="100%" height={250})
  - Tooltip на hover бара: название + количество + процент

### EmptyState для аналитики
- [ ] Использовать существующий EmptyState компонент [AC 4]:
  - Иконка: BarChart3 (lucide-react)
  - Заголовок: "Ожидание ответов"
  - Описание: "Когда респонденты начнут проходить опрос, здесь появится аналитика"
  - Условие отображения: totalRespondents === 0

### Вкладка "Метрики" — композиция
- [ ] Создать `apps/web/src/components/analytics/MetricsTab.tsx` [AC 1-4]:
  - Проверка на пустые данные -> EmptyState [AC 4]
  - MetricCards (сверху) [AC 1]
  - NpsGauge (под карточками) [AC 2]
  - AnswerDistribution (ниже) [AC 3]
  - Вертикальный layout с gap-6

### Заглушки для других вкладок
- [ ] Создать placeholder для вкладки "Heatmap" (будет реализован в Story 6.3) [AC 5]
- [ ] Создать placeholder для вкладки "Респонденты" (будет реализован в Story 6.4) [AC 5]

## Dev Notes

### Критические технические требования
- Next.js 16.2.0 (App Router), React 19
- Recharts (latest) — для bar charts и pie charts (AR16)
- shadcn/ui v4 (Card, Tabs, Skeleton) — установить через `npx shadcn@latest add tabs card skeleton`
- TanStack Query (React Query) для data fetching (AR15)
- lucide-react для иконок

### Архитектурные решения
- **React Query для server state:** Все данные аналитики загружаются через useQuery. Нет Zustand для аналитических данных — это server state
- **Recharts конфигурация:** ResponsiveContainer для адаптации размера, Tooltip для интерактивности, Legend для подписей. Цвета из дизайн-системы (slate, rose, amber, emerald)
- **NpsGauge — кастомный компонент (не Recharts):** Stacked bar реализуется через CSS div-ы, не через Recharts — проще и точнее контроль layout (UX-DR7). Крупное число NPS — простой Typography
- **Skeleton loading:** Использовать shadcn/ui Skeleton компонент. Для MetricCards — три Card-скелетона. Для NpsGauge — один прямоугольный скелетон. Для charts — прямоугольные скелетоны по высоте графика
- **Tabs state:** URL hash или React state. При переключении вкладки не перезагружать данные (React Query кэш)
- **Responsive grid:** MetricCards — grid-cols-3 на desktop. На планшете допустим grid-cols-1 (desktop-only, но для красоты)

### ЗАПРЕТЫ (anti-patterns)
- НЕ использовать Zustand для данных аналитики — только React Query
- НЕ реализовывать фильтры в этой story (будут в Story 6.4)
- НЕ реализовывать heatmap-компоненты в этой story (будут в Story 6.3)
- НЕ реализовывать таблицу респондентов в этой story (будут в Story 6.4)
- НЕ использовать Chart.js или D3 — только Recharts (AR16)
- НЕ мутировать props в React-компонентах
- НЕ использовать `any` type
- НЕ хардкодить тексты — выносить в константы или получать с сервера

### Previous Story Context
- **Epic 1 (Story 1.5):** App shell с sidebar, layout, EmptyState компонент, Skeleton, Toast, Breadcrumb
- **Epic 3 (Story 3.2):** React Flow канвас, кастомные ноды — переиспользуется в Story 6.3
- **Epic 4 (Story 4.3):** SurveyCard с badge статусов, переход по клику Active/Completed -> analytics
- **Story 6.1:** Backend API эндпоинты — /analytics/summary, /analytics/distribution (эта story зависит от 6.1)

### Project Structure Notes
```
apps/web/src/
├── app/(admin)/surveys/[id]/analytics/
│   └── page.tsx                      # Серверный компонент страницы
├── components/analytics/
│   ├── MetricCards.tsx                # Карточки метрик (3 колонки)
│   ├── NpsGauge.tsx                  # NPS виджет (число + stacked bar)
│   ├── AnswerDistribution.tsx        # Графики распределения ответов (Recharts)
│   ├── MetricsTab.tsx                # Композиция вкладки "Метрики"
│   ├── SatisfactionMatrix.tsx        # Placeholder (реализуется позже)
│   └── HeatmapView.tsx              # Placeholder (Story 6.3)
├── hooks/
│   └── useAnalytics.ts              # React Query хуки для аналитики
└── lib/
    └── apiClient.ts                 # Axios/fetch wrapper с JWT (существует)
```

### References
- **FR38:** Общий дашборд (количество ответов, completion rate, средний NPS)
- **FR39:** Распределение ответов по каждому вопросу (гистограмма, pie chart)
- **UX-DR7:** NpsGauge — крупное число NPS (-100..+100) + stacked bar (detractor/passive/promoter) + проценты
- **UX-DR9:** Цветовая система — slate палитра, emerald success, amber warning, rose error
- **UX-DR13:** Паттерны обратной связи — skeleton loading, empty states
- **UX-DR16:** Tabs аналитики: Метрики | Heatmap | Респонденты
- **AR15:** React Query для server state
- **AR16:** Recharts для аналитики

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
