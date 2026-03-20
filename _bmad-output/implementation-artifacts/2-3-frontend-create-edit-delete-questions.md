# Story 2.3: Frontend — создание, редактирование и удаление вопросов

Status: ready-for-dev

## Story

As a пользователь,
I want создавать, редактировать и удалять вопросы через удобные формы,
So that я могу наполнять библиотеку вопросами для своих опросов.

## Acceptance Criteria

1. **Given** пользователь на странице /questions
   **When** нажимает кнопку "Новый вопрос"
   **Then** открывается Dialog с формой: выбор типа (Select), текст вопроса (Textarea)
   **And** при выборе типа closed/matrix/multi_select появляются поля для вариантов ответов
   **And** все поля в одном view без wizard (UX-DR15)

2. **Given** форма создания открыта
   **When** пользователь заполняет поля и нажимает "Сохранить"
   **Then** вопрос создаётся через API, таблица обновляется (React Query invalidation)
   **And** toast "Вопрос создан" появляется на 3 секунды (FR1)

3. **Given** форма создания открыта
   **When** пользователь оставляет обязательное поле пустым и уходит с него (blur)
   **Then** отображается inline-ошибка под полем (rose-400 border) (UX-DR15)

4. **Given** вопрос без ответов в таблице
   **When** пользователь нажимает кнопку редактирования
   **Then** открывается Dialog с заполненной формой, данные можно изменить (FR3)

5. **Given** вопрос с ответами в таблице
   **When** пользователь видит этот вопрос
   **Then** кнопки редактирования и удаления недоступны (disabled или скрыты)
   **And** отображается индикатор "Есть ответы" (FR5)

6. **Given** вопрос без ответов
   **When** пользователь нажимает кнопку удаления
   **Then** открывается confirm Dialog с описанием последствий
   **And** при подтверждении вопрос удаляется, таблица обновляется, toast "Вопрос удалён" (FR4, UX-DR14)

7. **Given** API возвращает ошибку (например, 409 QUESTION_HAS_RESPONSES)
   **When** пользователь пытается редактировать/удалить
   **Then** отображается inline alert с понятным сообщением об ошибке

## Tasks / Subtasks

### React Query мутации

- [ ] **T1** Создать API-функцию `createQuestion(dto: ICreateQuestionDto): Promise<IQuestionResponseDto>` — POST /api/v1/questions [AC2]
- [ ] **T2** Создать API-функцию `updateQuestion(id: number, dto: IUpdateQuestionDto): Promise<IQuestionResponseDto>` — PUT /api/v1/questions/:id [AC4]
- [ ] **T3** Создать API-функцию `deleteQuestion(id: number): Promise<void>` — DELETE /api/v1/questions/:id [AC6]
- [ ] **T4** Создать хук `useCreateQuestion()` в `useQuestions.ts` — обёртка над `useMutation`, onSuccess: invalidateQueries(['questions']), toast "Вопрос создан" [AC2]
- [ ] **T5** Создать хук `useUpdateQuestion()` — обёртка над `useMutation`, onSuccess: invalidateQueries(['questions']), toast "Вопрос обновлён" [AC4]
- [ ] **T6** Создать хук `useDeleteQuestion()` — обёртка над `useMutation`, onSuccess: invalidateQueries(['questions']), toast "Вопрос удалён" [AC6]
- [ ] **T7** Во всех мутациях: onError — обработка ошибки. Если errorCode === QUESTION_HAS_RESPONSES, показать alert "Вопрос нельзя изменить — на него уже есть ответы". Для других ошибок — generic toast [AC7]

### Компонент QuestionForm

- [ ] **T8** Создать `apps/web/src/components/question/QuestionForm.tsx` — форма на React Hook Form. Поля: type (Select), text (Textarea), options (динамический список Input) [AC1]
- [ ] **T9** Поле type — shadcn/ui Select с вариантами: NPS, Открытый, Закрытый, Матричный, Мульти-селект. Использовать русские лейблы из `questionTypeConfig.ts` (Story 2.2). При редактировании type disabled (тип не меняется) [AC1]
- [ ] **T10** Поле text — shadcn/ui Textarea, обязательное, placeholder "Текст вопроса..." [AC1]
- [ ] **T11** Условное отображение поля options: показывать только при type = closed | matrix | multi_select. Динамический список: кнопка "+ Добавить вариант", каждый вариант — Input + кнопка удаления (Ghost, иконка "×"). Минимум 2 варианта для этих типов [AC1]
- [ ] **T12** Валидация React Hook Form: mode "onBlur" для inline-валидации при потере фокуса. Rules: text — required ("Введите текст вопроса"), type — required ("Выберите тип"), options — minLength 2 для closed/matrix/multi_select ("Добавьте минимум 2 варианта"), каждый option — required ("Вариант не может быть пустым") [AC3]
- [ ] **T13** При ошибке валидации: border поля меняется на rose-400, под полем отображается текст ошибки цветом rose-500 [AC3]
- [ ] **T14** QuestionForm принимает props: `mode: 'create' | 'edit'`, `defaultValues?: IQuestionResponseDto`, `onSubmit: (data) => void`, `isSubmitting: boolean`. При edit mode: type disabled, форма предзаполнена [AC1, AC4]

### Dialog создания вопроса

- [ ] **T15** Создать компонент `CreateQuestionDialog` (или встроить в QuestionsPageContent). Trigger: кнопка "Новый вопрос" (Primary, в header страницы). Dialog содержит QuestionForm в mode="create" [AC1]
- [ ] **T16** Заголовок Dialog: "Новый вопрос". Кнопки footer: "Отмена" (Outline), "Сохранить" (Primary). При submit: вызов useCreateQuestion mutation. При isSubmitting: кнопка "Сохранить" disabled + текст "Сохранение..." [AC2]
- [ ] **T17** При успешном создании: Dialog закрывается, форма сбрасывается [AC2]

### Dialog редактирования

- [ ] **T18** Создать компонент `EditQuestionDialog`. Trigger: кнопка редактирования (Ghost/SM, иконка карандаша) в строке таблицы. Кнопка disabled если hasResponses === true [AC4, AC5]
- [ ] **T19** Dialog содержит QuestionForm в mode="edit" с defaultValues из выбранного вопроса. Заголовок: "Редактирование вопроса". При submit: вызов useUpdateQuestion mutation [AC4]
- [ ] **T20** При успешном обновлении: Dialog закрывается [AC4]

### Dialog подтверждения удаления

- [ ] **T21** Создать компонент `DeleteQuestionDialog`. Trigger: кнопка удаления (Ghost/SM, иконка корзины, красный текст) в строке таблицы. Кнопка disabled если hasResponses === true [AC5, AC6]
- [ ] **T22** Dialog содержит: текст предупреждения "Вы уверены, что хотите удалить вопрос '{questionText}'? Это действие необратимо.". Кнопки: "Отмена" (Outline), "Удалить" (деструктивная — красный текст/бордер) [AC6]
- [ ] **T23** При подтверждении: вызов useDeleteQuestion mutation. При isSubmitting: кнопка disabled + "Удаление..." [AC6]

### Индикатор "Есть ответы"

- [ ] **T24** В строке таблицы вопроса: если hasResponses === true, отображать Badge "Есть ответы" (slate-100, slate-500 text) или иконку замка. Кнопки редактирования и удаления disabled с opacity-50 [AC5]
- [ ] **T25** Tooltip на disabled кнопках: "Нельзя изменить — есть ответы" (через shadcn/ui Tooltip) [AC5]

### Обработка ошибок API

- [ ] **T26** При 409 QUESTION_HAS_RESPONSES — показать inline Alert в Dialog: "Этот вопрос нельзя изменить, так как на него уже есть ответы респондентов" [AC7]
- [ ] **T27** При других ошибках API (500, network error) — toast с generic сообщением "Произошла ошибка. Попробуйте ещё раз" [AC7]

### Интеграция с таблицей из Story 2.2

- [ ] **T28** Обновить страницу /questions: добавить кнопку "Новый вопрос" в header (рядом с заголовком "Библиотека вопросов"). Эта же кнопка — CTA в EmptyState [AC1]
- [ ] **T29** В каждой строке таблицы добавить колонку "Действия" с кнопками редактирования и удаления [AC4, AC5, AC6]

## Dev Notes

### Критические технические требования

- **React Hook Form** для управления формами — mode: "onBlur" для валидации
- **shadcn/ui** компоненты: Dialog, Select, Textarea, Input, Button, Badge, Tooltip, Alert
- **React Query useMutation** для create/update/delete с invalidation
- **Toast** из shadcn/ui (или из Story 1.5) для уведомлений — зелёный success, auto-hide 3s
- Типы `ICreateQuestionDto`, `IUpdateQuestionDto`, `ErrorCode` из `@bmad-cem/shared`

### Архитектурные решения

- **React Hook Form** — единая форма `QuestionForm` для создания и редактирования. Props определяют режим (create/edit). Валидация через register + rules, не через zod/yup (упрощение для MVP).
- **Dialog pattern** — shadcn/ui Dialog с контролируемым state (open/setOpen). Закрытие при Esc, клике вне, кнопке "×", успешном submit.
- **React Query invalidation** — после успешной мутации `queryClient.invalidateQueries({queryKey: ['questions']})` для автоматического refetch списка.
- **Динамический список options** — React Hook Form `useFieldArray` для управления массивом вариантов ответов. Кнопка "+" добавляет пустой Input, кнопка "×" удаляет.
- **Error handling** — в onError мутации проверять `error.response.data.errorCode` из ErrorCode enum. QUESTION_HAS_RESPONSES -> специфическое сообщение, остальные -> generic.
- **Деструктивные действия** — кнопка удаления: красный текст (text-rose-500) на outline-кнопке + confirm Dialog перед действием (UX-DR14).

### ЗАПРЕТЫ (anti-patterns)

- НЕ использовать wizard/multi-step для формы — все поля в одном view (UX-DR15)
- НЕ позволять менять тип вопроса при редактировании — type readonly в edit mode
- НЕ реализовывать автосохранение формы — только явная кнопка "Сохранить"
- НЕ делать вложенные диалоги — максимум один Dialog одновременно
- НЕ использовать window.confirm — только shadcn/ui Dialog для подтверждений
- НЕ мутировать props или state напрямую
- НЕ использовать `any` тип
- НЕ скрывать кнопки edit/delete для вопросов с ответами — делать их disabled (пользователь должен видеть, что действие существует, но недоступно)
- НЕ создавать отдельные страницы для создания/редактирования — всё в Dialog на странице /questions

### Previous Story Context

- **Story 2.1** создала backend API:
  - POST /api/v1/questions — создание вопроса
  - PUT /api/v1/questions/:id — обновление (409 если есть ответы)
  - DELETE /api/v1/questions/:id — удаление (409 если есть ответы)
  - Response format: `{data: IQuestionResponseDto, meta: {}}`
  - IQuestionResponseDto содержит поле `hasResponses: boolean`
- **Story 2.2** создала:
  - Страница /questions с таблицей, фильтрами, поиском, пагинацией
  - Хук `useQuestions(params)` для загрузки списка
  - Компонент `QuestionFilters` с pill-кнопками и поиском
  - `questionTypeConfig.ts` — маппинг типов на цвета и лейблы
  - Skeleton loading и EmptyState
  - API-функция `fetchQuestions`
  - Строки таблицы уже содержат заготовки для кнопок действий (disabled)

### Project Structure Notes

```
apps/web/src/
├── app/(admin)/questions/
│   └── page.tsx                          # Обновить: добавить кнопку "Новый вопрос", колонку действий
├── components/question/
│   ├── QuestionForm.tsx                  # СОЗДАТЬ: форма создания/редактирования
│   ├── QuestionFilters.tsx               # Уже из Story 2.2
│   ├── CreateQuestionDialog.tsx          # СОЗДАТЬ: Dialog создания
│   ├── EditQuestionDialog.tsx            # СОЗДАТЬ: Dialog редактирования
│   └── DeleteQuestionDialog.tsx          # СОЗДАТЬ: Dialog подтверждения удаления
├── hooks/
│   └── useQuestions.ts                   # Обновить: добавить useCreateQuestion, useUpdateQuestion, useDeleteQuestion
├── lib/
│   ├── apiClient.ts                      # Уже существует
│   ├── api/questions.ts                  # Обновить: добавить createQuestion, updateQuestion, deleteQuestion
│   └── questionTypeConfig.ts             # Уже из Story 2.2
```

### References

- PRD: FR1 (создание вопросов), FR3 (редактирование), FR4 (удаление), FR5 (блокировка при ответах)
- UX Design: UX-DR13 (toast success 3s, inline errors), UX-DR14 (деструктивные — красный + confirm), UX-DR15 (все поля в одном view, валидация onBlur + submit)
- Architecture: React Hook Form для форм, React Query для server state
- Architecture: Frontend Structure (components/question/)

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
