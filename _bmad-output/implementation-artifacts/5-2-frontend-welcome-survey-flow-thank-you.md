# Story 5.2: Frontend — welcome, прохождение и thank you

Status: ready-for-dev

## Story

As a респондент,
I want понятный и приятный интерфейс прохождения опроса,
So that я могу быстро ответить на вопросы без затруднений.

## Acceptance Criteria

1. **Welcome-экран при открытии ссылки**
   - Given респондент открывает /respond/[token]
   - When токен валиден и опрос active
   - Then отображается welcome-экран: название опроса, описание, количество вопросов, примерное время прохождения, кнопка "Начать опрос" (FR30)

2. **Пошаговый формат — RespondentCard с первым вопросом**
   - Given респондент нажимает "Начать опрос"
   - When загружается первый вопрос
   - Then отображается RespondentCard: текст вопроса + элемент ответа + кнопка "Далее" (FR31)

3. **NPS-вопрос — кнопки 0-10**
   - Given вопрос типа NPS
   - When отображается RespondentCard
   - Then сетка кнопок 0-10 с подписями "Совсем нет" / "Обязательно" (UX-DR6)
   - And кнопки 40-48px, touch-friendly

4. **Открытый вопрос — textarea**
   - Given вопрос типа открытый
   - When отображается RespondentCard
   - Then Textarea для свободного ответа (UX-DR6)

5. **Закрытый вопрос — RadioGroup**
   - Given вопрос типа закрытый
   - When отображается RespondentCard
   - Then RadioGroup с вариантами ответа, вся строка кликабельна (UX-DR6)

6. **Матричный вопрос — таблица RadioGroup**
   - Given вопрос типа матричный
   - When отображается RespondentCard
   - Then таблица с RadioGroup в каждой строке (UX-DR6)

7. **Мульти-селект вопрос — Checkbox**
   - Given вопрос типа мульти-селект
   - When отображается RespondentCard
   - Then Checkbox группа с вариантами (UX-DR6)

8. **Empty state — кнопка "Далее" disabled**
   - Given респондент не выбрал ответ
   - When проверяется кнопка "Далее"
   - Then кнопка disabled (empty state) (UX-DR6)

9. **Отправка ответа и переход к следующему вопросу**
   - Given респондент выбрал ответ
   - When нажимает "Далее"
   - Then кнопка переходит в submitting state (disabled + "Отправка...")
   - And ответ отправляется на backend (FR37)
   - And отображается следующий вопрос по бранчингу

10. **Экран "Спасибо" после завершения**
    - Given респондент ответил на последний вопрос
    - When backend возвращает completed: true
    - Then отображается экран "Спасибо": благодарность, "Ваши ответы сохранены" (FR35)

11. **Невалидный или просроченный токен**
    - Given невалидный или просроченный токен
    - When респондент открывает ссылку
    - Then отображается экран "Опрос не найден или уже завершён"

12. **Повторное прохождение**
    - Given респондент уже прошёл опрос
    - When открывает ссылку повторно
    - Then отображается экран "Вы уже прошли этот опрос, спасибо!"

## Tasks / Subtasks

- [ ] Task 1: Страница /respond/[token] — основной контейнер (AC: #1, #11, #12)
  - [ ] 1.1 Создать `apps/web/src/app/respond/[token]/page.tsx` (НЕ в (admin) route group)
  - [ ] 1.2 Создать layout для respond — минимальный, без sidebar, центрированный контент
  - [ ] 1.3 При загрузке вызвать GET /api/v1/respond/:token через apiClient (без JWT)
  - [ ] 1.4 Обработать состояния: loading (skeleton), error (404/410), success (welcome/question/completed)
  - [ ] 1.5 Управлять state прохождения: currentScreen ('welcome' | 'question' | 'thankyou' | 'error'), currentQuestion, surveyInfo

- [ ] Task 2: Компонент WelcomeScreen (AC: #1)
  - [ ] 2.1 Создать `apps/web/src/components/respondent/WelcomeScreen.tsx`
  - [ ] 2.2 Отобразить: название опроса (h1), описание (если есть), количество вопросов, примерное время ("~X минут", из расчёта 30 сек на вопрос)
  - [ ] 2.3 Кнопка "Начать опрос" (Primary, full-width, height 48px)
  - [ ] 2.4 Стилизация: центрированная карточка max-width 480px, rounded-xl, shadow, padding 24px (UX-DR12)
  - [ ] 2.5 Тёплый, приглашающий тон текста

- [ ] Task 3: Компонент RespondentCard — контейнер вопроса (AC: #2, #8, #9)
  - [ ] 3.1 Создать `apps/web/src/components/respondent/RespondentCard.tsx`
  - [ ] 3.2 Props: question (type, text, options), onSubmit(answer), isSubmitting
  - [ ] 3.3 Отобразить: текст вопроса (h2) + элемент ответа (по типу) + кнопка "Далее"
  - [ ] 3.4 Кнопка "Далее": disabled если ответ не выбран, submitting state ("Отправка..." + disabled)
  - [ ] 3.5 Стилизация: max-width 480px, центрирована, rounded-xl, shadow, padding 24px (UX-DR12)
  - [ ] 3.6 Определить тип вопроса и рендерить соответствующий input компонент

- [ ] Task 4: Компонент NpsInput (AC: #3)
  - [ ] 4.1 Создать `apps/web/src/components/respondent/NpsInput.tsx`
  - [ ] 4.2 Сетка кнопок 0-10 в ряд (flex-wrap на мобильном)
  - [ ] 4.3 Подписи: "Совсем нет" слева под 0, "Обязательно" справа под 10
  - [ ] 4.4 Размер кнопок: 48px на десктопе, 40px на мобильном (UX-DR6, UX-DR12)
  - [ ] 4.5 Выбранная кнопка: bg-slate-600 text-white (Primary стиль)
  - [ ] 4.6 Touch-friendly: минимум 44x44px touch target (UX-DR19)
  - [ ] 4.7 Props: value, onChange(value: number)

- [ ] Task 5: Элемент ответа — открытый вопрос (AC: #4)
  - [ ] 5.1 Внутри RespondentCard рендерить Textarea (shadcn/ui) для типа open
  - [ ] 5.2 Placeholder: "Напишите ваш ответ..."
  - [ ] 5.3 Минимальная высота 120px, resize vertical
  - [ ] 5.4 Props: value, onChange(value: string)

- [ ] Task 6: Элемент ответа — закрытый вопрос (AC: #5)
  - [ ] 6.1 Внутри RespondentCard рендерить RadioGroup (shadcn/ui) для типа closed
  - [ ] 6.2 Каждый вариант — RadioGroupItem с label, вся строка кликабельна
  - [ ] 6.3 Крупный touch target: минимум 44px высота строки (UX-DR19)
  - [ ] 6.4 Props: options[], value, onChange(value: string)

- [ ] Task 7: Элемент ответа — матричный вопрос (AC: #6)
  - [ ] 7.1 Внутри RespondentCard рендерить таблицу с RadioGroup для типа matrix
  - [ ] 7.2 Строки — подвопросы (rows), колонки — варианты ответа (columns)
  - [ ] 7.3 Каждая ячейка — RadioGroupItem
  - [ ] 7.4 На мобильном: горизонтальный скролл таблицы или стек layout
  - [ ] 7.5 Props: rows[], columns[], value (объект {rowId: selectedColumn}), onChange

- [ ] Task 8: Элемент ответа — мульти-селект (AC: #7)
  - [ ] 8.1 Внутри RespondentCard рендерить Checkbox группу (shadcn/ui) для типа multi_select
  - [ ] 8.2 Каждый вариант — Checkbox с label, вся строка кликабельна
  - [ ] 8.3 Крупный touch target: минимум 44px высота строки (UX-DR19)
  - [ ] 8.4 Props: options[], value (string[]), onChange(value: string[])

- [ ] Task 9: Компонент ThankYouScreen (AC: #10)
  - [ ] 9.1 Создать `apps/web/src/components/respondent/ThankYouScreen.tsx`
  - [ ] 9.2 Отобразить: иконка (check/heart), "Спасибо!" (h1), "Ваши ответы сохранены", подтекст благодарности
  - [ ] 9.3 Стилизация: центрированная карточка, мягкий зелёный акцент (emerald-50 фон или emerald иконка)
  - [ ] 9.4 Нет кнопок навигации (финальный экран)

- [ ] Task 10: Экраны ошибок (AC: #11, #12)
  - [ ] 10.1 Создать компонент ErrorScreen или использовать inline в page.tsx
  - [ ] 10.2 Для 404 (RESPONDENT_NOT_FOUND): "Опрос не найден или уже завершён"
  - [ ] 10.3 Для 410 (SURVEY_ALREADY_COMPLETED): "Вы уже прошли этот опрос, спасибо!"
  - [ ] 10.4 Для 410 (SURVEY_NOT_ACTIVE): "Этот опрос больше не принимает ответы"
  - [ ] 10.5 Стилизация: центрированная карточка, нейтральный тон

- [ ] Task 11: Хук useRespondentFlow (AC: #1, #2, #9, #10)
  - [ ] 11.1 Создать `apps/web/src/hooks/useRespondentFlow.ts`
  - [ ] 11.2 Инкапсулировать: загрузка опроса (GET /respond/:token), отправка ответа (POST /respond/:token/answer)
  - [ ] 11.3 Управлять state: screen, currentQuestion, surveyInfo, isSubmitting, error
  - [ ] 11.4 Вызов через apiClient без JWT-заголовка (публичный API)
  - [ ] 11.5 При отправке ответа: обновить currentQuestion из response, или перейти на ThankYou если completed

- [ ] Task 12: API-клиент — публичные вызовы без JWT (AC: #1, #9)
  - [ ] 12.1 В `apps/web/src/lib/apiClient.ts` — обеспечить возможность вызова без Authorization header
  - [ ] 12.2 Добавить функции: getRespondentSurvey(token), submitRespondentAnswer(token, body)
  - [ ] 12.3 Обработка ошибок: парсинг errorCode из response body

## Dev Notes

### Критические технические требования

**Версии пакетов:**
- Next.js: 16.2.0 (App Router)
- shadcn/ui: v4 (Radix UI примитивы)
- React: версия из Next.js 16.2.0

**shadcn/ui компоненты (должны быть установлены):**
- Button, Card, RadioGroup, Checkbox, Textarea, Progress — из Epic 1 или установить сейчас
- Если компонент не установлен: `npx shadcn@latest add <component>`

**Респондентский layout (UX-DR12):**
- Центрированная карточка max-width 480px
- padding 24px (desktop) / 16px (mobile)
- full-width на <640px, без border-radius
- На ≥640px: rounded-xl, shadow
- Прогресс-бар сверху (реализация в Story 5.3)

**UX-DR6 — RespondentCard варианты:**
- NPS: кнопки 0-10 (40-48px), подписи "Совсем нет" / "Обязательно"
- Открытый: Textarea
- Закрытый: RadioGroup (вся строка кликабельна)
- Матричный: таблица с RadioGroup
- Мульти-селект: Checkbox группа

**UX-DR6 — States:**
- empty: кнопка "Далее" disabled (opacity-50)
- answered: кнопка "Далее" активна (Primary, slate-600)
- submitting: кнопка disabled + текст "Отправка..."

### Архитектурные решения

**Routing (Next.js App Router):**
- Страница: `apps/web/src/app/respond/[token]/page.tsx`
- НЕ в (admin) route group — нет sidebar, нет JWT middleware
- Layout: минимальный, только центрирование + фон slate-50

**State management:**
- НЕ использовать Zustand (это для граф-конструктора)
- useState / useReducer в хуке useRespondentFlow
- React Query НЕ обязателен для респондента (простой fetch → state), но допустим для удобства

**API вызовы:**
- GET /api/v1/respond/:token — начальная загрузка (survey info + первый вопрос или resume)
- POST /api/v1/respond/:token/answer — отправка каждого ответа отдельно (FR37)
- Без Authorization header (публичный API)

**Кнопка "Далее" — full-width, height 48px (UX-DR12):**
```tsx
<Button
  className="w-full h-12 text-base"
  disabled={!hasAnswer || isSubmitting}
  onClick={handleSubmit}
>
  {isSubmitting ? "Отправка..." : "Далее"}
</Button>
```

**NPS кнопки — сетка 0-10:**
```tsx
// Flex-wrap ряд, gap-1, кнопки квадратные
<div className="flex flex-wrap gap-1 justify-center">
  {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
    <button
      key={n}
      className={cn(
        "w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-medium",
        value === n ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      )}
      onClick={() => onChange(n)}
    >
      {n}
    </button>
  ))}
</div>
```

### ЗАПРЕТЫ (anti-patterns)

- НЕ добавлять прогресс-бар — это Story 5.3
- НЕ реализовывать localStorage persistence — это Story 5.3
- НЕ добавлять mobile responsive адаптацию — это Story 5.3 (базовая max-width 480px допустима)
- НЕ добавлять кнопку "Назад" — forward-only навигация (FR33, Story 5.3)
- НЕ создавать backend эндпоинты — это Story 5.1
- НЕ использовать Zustand для state респондента
- НЕ мутировать props в React-компонентах
- НЕ возвращать серверные компоненты с client-side логикой — page.tsx должен быть "use client" или использовать client-компонент
- НЕ использовать `any` type
- НЕ стилизовать компоненты админки — это изолированный UX-контекст

### Previous Story Context

**Story 5.1 (backend, эта же Epic) создаёт:**
- GET /api/v1/respond/:token — возвращает surveyTitle, surveyDescription, question, totalQuestions, answeredCount
- POST /api/v1/respond/:token/answer — принимает {questionId, answer}, возвращает {question (следующий), completed}
- Ответы формата: { data: {...}, meta: {} }

**Epic 1 (Story 1.5) создал:**
- shadcn/ui базовые компоненты (Button, Card, и др.)
- Layout админки с sidebar
- Шрифт Inter, цветовая палитра slate, светлая тема
- apiClient.ts в apps/web/src/lib/

**Epic 1 (Story 1.1) создал:**
- apps/web — Next.js 16 с App Router, Tailwind, shadcn/ui
- Корневой layout apps/web/src/app/layout.tsx

### Project Structure Notes

**Новые файлы этой истории:**
```
apps/web/src/
├── app/
│   └── respond/
│       └── [token]/
│           ├── page.tsx              # НОВЫЙ — страница прохождения
│           └── layout.tsx            # НОВЫЙ (опционально) — минимальный layout
├── components/
│   └── respondent/
│       ├── WelcomeScreen.tsx         # НОВЫЙ
│       ├── RespondentCard.tsx        # НОВЫЙ — контейнер вопроса
│       ├── NpsInput.tsx              # НОВЫЙ — кнопки 0-10
│       └── ThankYouScreen.tsx        # НОВЫЙ
├── hooks/
│   └── useRespondentFlow.ts          # НОВЫЙ
└── lib/
    └── apiClient.ts                  # РАСШИРИТЬ — добавить публичные вызовы
```

**Компоненты shadcn/ui (используются, должны быть установлены):**
```
apps/web/src/components/ui/
├── button.tsx
├── card.tsx
├── radio-group.tsx
├── checkbox.tsx
├── textarea.tsx
└── progress.tsx    # Для Story 5.3
```

### References

- [Source: planning-artifacts/epics.md § Story 5.2: Frontend — welcome, прохождение и thank you]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR6: RespondentCard]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR12: Layout респондента]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR19: Accessibility — touch targets 44x44px]
- [Source: planning-artifacts/ux-design-specification.md § UX-DR20: Responsive — респондент mobile-first]
- [Source: planning-artifacts/ux-design-specification.md § Journey 3: Респондент проходит опрос]
- [Source: planning-artifacts/ux-design-specification.md § Component Strategy — RespondentCard]
- [Source: planning-artifacts/architecture.md § Frontend Structure — respond/[token]]
- [Source: planning-artifacts/architecture.md § Architectural Boundaries — Respondent UI]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
