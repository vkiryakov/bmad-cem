# Story 5.3: Frontend — прогресс-бар, навигация, localStorage и mobile

Status: ready-for-dev

## Story

As a респондент,
I want видеть прогресс прохождения и не потерять ответы при сбое,
So that я уверен в процессе и могу продолжить с того места, где остановился.

## Acceptance Criteria

1. **Прогресс-бар с учётом бранчинга**
   - Given респондент проходит опрос
   - When отображается прогресс-бар
   - Then показывает "Вопрос X из Y" где Y — длина текущего пути с учётом бранчинга (FR32)
   - And Progress компонент визуально заполняется пропорционально

2. **Навигация только вперёд**
   - Given респондент на любом вопросе
   - When проверяется навигация
   - Then доступна только кнопка "Далее" (навигация только вперёд, нет кнопки "Назад") (FR33)

3. **Сохранение прогресса в localStorage**
   - Given респондент ответил на вопрос
   - When ответ успешно отправлен
   - Then прогресс (текущий questionId, список отвеченных) сохраняется в localStorage (FR34)

4. **Восстановление из localStorage при возврате**
   - Given респондент закрыл браузер и вернулся по ссылке
   - When страница загружается
   - Then localStorage проверяется, если прогресс есть — продолжение с последнего неотвеченного вопроса (FR34)
   - And backend подтверждает прогресс (localStorage синхронизирован с сервером)

5. **Mobile layout (<640px)**
   - Given интерфейс респондента на мобильном (<640px)
   - When отображается карточка
   - Then карточка full-width с padding 16px, без border-radius (UX-DR12, UX-DR20)
   - And кнопка "Далее" full-width, height 48px
   - And NPS кнопки 40px с gap 4px
   - And текст вопроса 16px

6. **Desktop layout (≥640px)**
   - Given интерфейс респондента на десктопе (≥640px)
   - When отображается карточка
   - Then карточка центрирована, max-width 480px, padding 24px, rounded-xl, shadow (UX-DR12)
   - And NPS кнопки 48px
   - And текст вопроса 20px

7. **Touch targets на мобильном**
   - Given все интерактивные элементы на мобильном
   - When проверяются touch targets
   - Then минимум 44x44px для кнопок, radio, checkbox (UX-DR19)

8. **Производительность — следующий вопрос < 1 секунды**
   - Given интерфейс респондента загружает следующий вопрос
   - When backend отвечает
   - Then следующий вопрос появляется за < 1 секунду (NFR4)

## Tasks / Subtasks

- [ ] Task 1: Компонент прогресс-бара (AC: #1)
  - [ ] 1.1 Создать компонент ProgressBar или использовать shadcn/ui Progress внутри страницы respond/[token]
  - [ ] 1.2 Отображать текст "Вопрос X из Y" над Progress компонентом
  - [ ] 1.3 Рассчитывать Y (общее количество) из данных backend: totalQuestions из GET /respond/:token или из flow graph
  - [ ] 1.4 Рассчитывать X (текущий) из answeredCount + 1 (текущий вопрос)
  - [ ] 1.5 Progress bar визуально: (answeredCount / totalQuestions) * 100%
  - [ ] 1.6 Стилизация: полная ширина сверху карточки, высота 4px, slate-200 фон, slate-600 заполнение

- [ ] Task 2: Позиционирование прогресс-бара (AC: #1, #5, #6)
  - [ ] 2.1 На мобильном (<640px): прогресс-бар full-width сверху страницы, фиксирован
  - [ ] 2.2 На десктопе (≥640px): прогресс-бар внутри карточки, сверху
  - [ ] 2.3 Текст "Вопрос X из Y": small text (12px), slate-500, центрирован

- [ ] Task 3: Forward-only навигация (AC: #2)
  - [ ] 3.1 В RespondentCard убедиться что нет кнопки "Назад"
  - [ ] 3.2 Убедиться что нет browser back button handler (не блокировать, но не реагировать на него для навигации по вопросам)
  - [ ] 3.3 Единственное действие — кнопка "Далее" для перехода к следующему вопросу

- [ ] Task 4: localStorage persistence — сохранение (AC: #3)
  - [ ] 4.1 Создать утилиту `apps/web/src/lib/respondentStorage.ts`
  - [ ] 4.2 Функция `saveProgress(token: string, data: RespondentProgress)` — сохранить в localStorage с ключом `respondent_progress_${token}`
  - [ ] 4.3 Структура данных RespondentProgress: { currentQuestionId: number, answeredQuestionIds: number[], answeredCount: number, lastUpdated: string (ISO) }
  - [ ] 4.4 Вызывать saveProgress после каждого успешного ответа (после POST /respond/:token/answer возвращает 200)
  - [ ] 4.5 Очищать localStorage при completed (вызвать clearProgress(token))

- [ ] Task 5: localStorage persistence — восстановление (AC: #4)
  - [ ] 5.1 Функция `getProgress(token: string): RespondentProgress | null` — прочитать из localStorage
  - [ ] 5.2 При загрузке страницы /respond/[token]: проверить localStorage
  - [ ] 5.3 Если прогресс есть — отправить GET /api/v1/respond/:token (backend вернёт resume вопрос)
  - [ ] 5.4 Сравнить localStorage данные с ответом backend: если backend вернул тот же вопрос — синхронизация ок
  - [ ] 5.5 Если расхождение — использовать данные backend как source of truth (backend знает реальный прогресс)
  - [ ] 5.6 Обновить localStorage с данными backend

- [ ] Task 6: Mobile responsive — карточка (AC: #5, #6)
  - [ ] 6.1 В RespondentCard добавить responsive классы:
    - Mobile (<640px): `w-full px-4 py-6` (full-width, padding 16px, без rounded и shadow)
    - Desktop (≥640px): `max-w-[480px] mx-auto px-6 py-8 rounded-xl shadow-sm` (центрирована, 480px, padding 24px)
  - [ ] 6.2 В WelcomeScreen — аналогичные responsive классы
  - [ ] 6.3 В ThankYouScreen — аналогичные responsive классы

- [ ] Task 7: Mobile responsive — текст вопроса (AC: #5, #6)
  - [ ] 7.1 Текст вопроса: `text-base sm:text-xl` (16px mobile, 20px desktop)
  - [ ] 7.2 Подписи NPS: `text-xs` на всех экранах

- [ ] Task 8: Mobile responsive — NPS кнопки (AC: #5, #6, #7)
  - [ ] 8.1 В NpsInput: `w-10 h-10 sm:w-12 sm:h-12` (40px mobile, 48px desktop)
  - [ ] 8.2 Gap: `gap-1` (4px)
  - [ ] 8.3 Touch target минимум 44x44px: на мобильном кнопки 40px, но с padding/margin обеспечить 44px touch area

- [ ] Task 9: Mobile responsive — кнопка "Далее" (AC: #5, #6, #7)
  - [ ] 9.1 Кнопка "Далее": full-width, height 48px на всех экранах
  - [ ] 9.2 Текст: `text-base` (16px)
  - [ ] 9.3 Touch target: 48px высота — выше минимума 44px

- [ ] Task 10: Mobile responsive — RadioGroup и Checkbox (AC: #5, #7)
  - [ ] 10.1 RadioGroup items: минимум 44px высота строки
  - [ ] 10.2 Checkbox items: минимум 44px высота строки
  - [ ] 10.3 Вся строка кликабельна, не только иконка
  - [ ] 10.4 Добавить `py-3` или аналогичный padding для достижения 44px

- [ ] Task 11: Mobile responsive — матричный вопрос (AC: #5, #7)
  - [ ] 11.1 На десктопе: таблица с RadioGroup
  - [ ] 11.2 На мобильном (<640px): стек layout — каждый подвопрос как отдельный блок с RadioGroup
  - [ ] 11.3 Или горизонтальный скролл таблицы с `overflow-x-auto`

- [ ] Task 12: Оптимизация производительности (AC: #8)
  - [ ] 12.1 Минимизировать re-renders: мемоизация NpsInput, RadioGroup обёрток
  - [ ] 12.2 Предзагрузка: при получении ответа от POST — сразу отобразить следующий вопрос из response (не делать дополнительный GET)
  - [ ] 12.3 Оптимистичная анимация: при нажатии "Далее" сразу показать loading state (не ждать ответа для визуальной обратной связи)
  - [ ] 12.4 Убедиться что transition между вопросами плавный (opacity или slide анимация, опционально)

- [ ] Task 13: Интеграция прогресс-бара и localStorage с useRespondentFlow (AC: #1, #3, #4)
  - [ ] 13.1 В хуке useRespondentFlow (из Story 5.2): добавить вызовы saveProgress / getProgress / clearProgress
  - [ ] 13.2 Добавить в state: answeredCount, totalQuestions для прогресс-бара
  - [ ] 13.3 При инициализации: проверить localStorage, при наличии — передать на UI прогресс

## Dev Notes

### Критические технические требования

**Версии пакетов:**
- Next.js: 16.2.0 (App Router)
- shadcn/ui: v4 — компонент Progress

**Progress компонент (shadcn/ui):**
Установить если не установлен: `npx shadcn@latest add progress`
```tsx
import { Progress } from "@/components/ui/progress";
<Progress value={percentage} className="h-1" />
```

**localStorage API:**
```typescript
// respondentStorage.ts
const STORAGE_KEY_PREFIX = 'respondent_progress_';

interface RespondentProgress {
  currentQuestionId: number;
  answeredQuestionIds: number[];
  answeredCount: number;
  lastUpdated: string; // ISO 8601
}
```

**Breakpoints (Tailwind CSS):**
- `<640px` (без префикса) — mobile
- `sm:` (≥640px) — desktop
- `lg:` (≥1024px) — не используется для респондента

### Архитектурные решения

**Прогресс-бар — "Вопрос X из Y" (FR32):**
Y (totalQuestions) берётся из ответа backend GET /respond/:token. Backend вычисляет длину пути с учётом бранчинга: для линейного опроса — количество вопросов, для ветвящегося — оценка длины текущей ветки. В MVP допустимо использовать общее количество вопросов в опросе как Y (не идеально для бранчинга, но приемлемо).

**localStorage vs backend — source of truth:**
Backend всегда является source of truth. localStorage — кэш для быстрого UX:
1. При загрузке: проверить localStorage → если есть, пропустить welcome и сразу показать loading
2. Отправить GET /respond/:token → backend вернёт resume-вопрос
3. Синхронизировать localStorage с ответом backend
4. При расхождении — верить backend

**Forward-only навигация (FR33):**
Не блокировать browser back button (это плохой UX). Если пользователь нажимает back:
- Он попадёт на предыдущий URL (или покинет страницу)
- При возврате на страницу — localStorage + backend resume вернут его на текущий вопрос

**Responsive strategy (UX-DR20):**
Респондент — mobile-first. Стили пишутся для mobile по умолчанию, desktop через `sm:` префикс.

**Карточка респондента — responsive (UX-DR12):**
```tsx
<div className={cn(
  // Mobile (default): full-width, no rounded
  "w-full px-4 py-6 bg-white",
  // Desktop (sm+): centered card
  "sm:max-w-[480px] sm:mx-auto sm:px-6 sm:py-8 sm:rounded-xl sm:shadow-sm"
)}>
  {children}
</div>
```

**NPS кнопки responsive:**
```tsx
<button className={cn(
  "w-10 h-10 sm:w-12 sm:h-12",  // 40px mobile, 48px desktop
  "rounded-lg font-medium text-sm",
  "min-w-[44px] min-h-[44px]"     // Touch target minimum
)}>
```

### ЗАПРЕТЫ (anti-patterns)

- НЕ создавать backend эндпоинты — это Story 5.1
- НЕ создавать RespondentCard, WelcomeScreen, ThankYouScreen, NpsInput с нуля — они создаются в Story 5.2, эта история РАСШИРЯЕТ их
- НЕ блокировать browser back button — это плохой UX паттерн
- НЕ хранить ответы в localStorage (только метаданные прогресса: questionId, answeredCount)
- НЕ делать localStorage единственным source of truth — backend всегда главнее
- НЕ добавлять кнопку "Назад" (FR33 — forward-only)
- НЕ реализовывать offline mode — только localStorage как кэш прогресса
- НЕ стилизовать под desktop-only — это mobile-first (UX-DR20)
- НЕ использовать `any` type
- НЕ трогать компоненты админки — изолированный UX-контекст
- НЕ добавлять responsive для админки — админка desktop-only (UX-DR20)

### Previous Story Context

**Story 5.2 (эта же Epic, предыдущая) создаёт:**
- apps/web/src/app/respond/[token]/page.tsx — страница прохождения
- apps/web/src/components/respondent/WelcomeScreen.tsx
- apps/web/src/components/respondent/RespondentCard.tsx (контейнер вопроса, 5 типов)
- apps/web/src/components/respondent/NpsInput.tsx (кнопки 0-10)
- apps/web/src/components/respondent/ThankYouScreen.tsx
- apps/web/src/hooks/useRespondentFlow.ts
- Базовая логика: welcome → question → question → ... → thankyou

**Story 5.1 (backend) создаёт:**
- GET /api/v1/respond/:token — возвращает surveyTitle, question, totalQuestions, answeredCount
- POST /api/v1/respond/:token/answer — возвращает {question, completed}
- Логика resume: backend возвращает правильный следующий вопрос для in_progress респондентов

**Epic 1 (Story 1.5) создал:**
- shadcn/ui компоненты (Button, Card, Progress и др.)
- Tailwind CSS с настроенными breakpoints
- Шрифт Inter, палитра slate

### Project Structure Notes

**Файлы этой истории (модификация существующих + новые):**
```
apps/web/src/
├── app/
│   └── respond/
│       └── [token]/
│           └── page.tsx              # МОДИФИЦИРОВАТЬ — добавить прогресс-бар, localStorage интеграцию
├── components/
│   └── respondent/
│       ├── RespondentCard.tsx        # МОДИФИЦИРОВАТЬ — responsive классы, touch targets
│       ├── WelcomeScreen.tsx         # МОДИФИЦИРОВАТЬ — responsive классы
│       ├── ThankYouScreen.tsx        # МОДИФИЦИРОВАТЬ — responsive классы
│       └── NpsInput.tsx              # МОДИФИЦИРОВАТЬ — responsive размеры кнопок
├── hooks/
│   └── useRespondentFlow.ts          # МОДИФИЦИРОВАТЬ — localStorage интеграция, прогресс
└── lib/
    └── respondentStorage.ts          # НОВЫЙ — localStorage утилиты
```

### References

- [Source: planning-artifacts/epics.md § Story 5.3: Frontend — прогресс-бар, навигация, localStorage и mobile]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR6: RespondentCard — states, sizes]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR12: Layout респондента — breakpoints, padding]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR19: Accessibility — touch targets 44x44px]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR20: Responsive — респондент mobile-first]
- [Source: planning-artifacts/ux-design-specification.md § Breakpoint Strategy — mobile/tablet/desktop]
- [Source: planning-artifacts/ux-design-specification.md § Journey 3: Респондент проходит опрос — localStorage]
- [Source: planning-artifacts/architecture.md § Frontend Architecture — state management]
- [Source: planning-artifacts/prd.md § FR32 — прогресс-бар]
- [Source: planning-artifacts/prd.md § FR33 — навигация только вперёд]
- [Source: planning-artifacts/prd.md § FR34 — localStorage persistence]
- [Source: planning-artifacts/prd.md § FR36 — мобильная адаптация]
- [Source: planning-artifacts/prd.md § NFR4 — следующий вопрос < 1 секунда]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
