# Story 1.3: Backend bootstrap — глобальные паттерны NestJS

Status: ready-for-dev

## Story

As a разработчик,
I want настроенный NestJS с глобальными паттернами (валидация, ошибки, формат ответов, Swagger),
So that все будущие модули автоматически следуют единым правилам.

## Acceptance Criteria

1. **ConfigModule настроен**
   - Given apps/api инициализирован
   - When настраивается ConfigModule
   - Then переменные окружения загружаются из .env (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, JWT_EXPIRES_IN)
   - And .env.example содержит шаблон всех переменных

2. **TypeORM подключён к PostgreSQL**
   - Given ConfigModule настроен
   - When настраивается TypeORM
   - Then подключение к PostgreSQL работает через database.config.ts
   - And synchronize: true для MVP
   - And naming strategy трансформирует camelCase → snake_case

3. **Глобальный ValidationPipe**
   - Given apps/api
   - When настраивается глобальный ValidationPipe
   - Then whitelist: true, forbidNonWhitelisted: true
   - And невалидные запросы возвращают 400 с описанием ошибок

4. **Глобальный ExceptionFilter**
   - Given apps/api
   - When настраивается глобальный ExceptionFilter
   - Then все ошибки возвращаются в формате {statusCode, message, errorCode}
   - And errorCode берётся из ErrorCode enum в shared
   - And неожиданные ошибки логируются и возвращают generic 500

5. **ResponseWrapper interceptor**
   - Given apps/api
   - When настраивается ResponseWrapper interceptor
   - Then все успешные ответы оборачиваются в {data, meta}
   - And списки с пагинацией содержат meta: {page, limit, total, totalPages}

6. **Swagger настроен**
   - Given apps/api
   - When настраивается Swagger
   - Then документация доступна на /api/docs
   - And DTO автоматически документируются через декораторы

7. **CORS настроен**
   - Given apps/api
   - When настраивается CORS
   - Then запросы с localhost:3000 принимаются
   - And запросы с других origin отклоняются

8. **Health endpoint работает**
   - Given apps/api
   - When создаётся тестовый эндпоинт GET /api/v1/health
   - Then возвращает {data: {status: "ok"}, meta: {}}
   - And подтверждает работу всех глобальных паттернов

## Tasks / Subtasks

- [ ] Task 1: Установка зависимостей (AC: #1-6)
  - [ ] 1.1 `pnpm add @nestjs/config @nestjs/typeorm typeorm pg class-validator class-transformer @nestjs/swagger` в apps/api
  - [ ] 1.2 `pnpm add typeorm-naming-strategies` в apps/api (для snake_case naming strategy)
  - [ ] 1.3 Убедиться что @bmad-cem/shared доступен как workspace-зависимость

- [ ] Task 2: ConfigModule и database.config (AC: #1, #2)
  - [ ] 2.1 Создать `apps/api/src/config/database.config.ts` — TypeOrmModuleAsyncOptions с использованием ConfigService
  - [ ] 2.2 Настроить TypeOrmModule.forRootAsync в app.module.ts с database.config
  - [ ] 2.3 Включить synchronize: true, snake_case naming strategy (SnakeNamingStrategy из typeorm-naming-strategies)
  - [ ] 2.4 Настроить ConfigModule.forRoot({ isGlobal: true }) в app.module.ts
  - [ ] 2.5 Создать/обновить `apps/api/.env` с переменными: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, JWT_EXPIRES_IN, CORS_ORIGIN
  - [ ] 2.6 Создать/обновить `apps/api/.env.example` с шаблоном всех переменных

- [ ] Task 3: Глобальный ValidationPipe (AC: #3)
  - [ ] 3.1 Создать `apps/api/src/common/pipes/validation.pipe.ts` — конфигурация ValidationPipe (whitelist: true, forbidNonWhitelisted: true, transform: true)
  - [ ] 3.2 Зарегистрировать глобально в main.ts через app.useGlobalPipes()

- [ ] Task 4: Глобальный ExceptionFilter (AC: #4)
  - [ ] 4.1 Создать `apps/api/src/common/filters/http-exception.filter.ts`
  - [ ] 4.2 Обработка HttpException — извлечь errorCode из response, вернуть { statusCode, message, errorCode }
  - [ ] 4.3 Обработка ValidationPipe ошибок — вернуть 400 с errorCode = VALIDATION_ERROR, message с объединёнными ошибками валидации
  - [ ] 4.4 Обработка неизвестных ошибок — логировать stack trace, вернуть 500 с errorCode = INTERNAL_ERROR
  - [ ] 4.5 Зарегистрировать глобально в main.ts через app.useGlobalFilters()

- [ ] Task 5: ResponseWrapper interceptor (AC: #5)
  - [ ] 5.1 Создать `apps/api/src/common/interceptors/response-wrapper.interceptor.ts`
  - [ ] 5.2 Оборачивать все ответы в { data: response, meta: {} }
  - [ ] 5.3 Если response уже содержит структуру { data, meta } (для пагинированных списков) — пробросить as-is
  - [ ] 5.4 Зарегистрировать глобально в main.ts через app.useGlobalInterceptors()

- [ ] Task 6: Swagger (AC: #6)
  - [ ] 6.1 Настроить SwaggerModule в main.ts: title "bmad-cem API", version "1.0", путь /api/docs
  - [ ] 6.2 Включить plugin в nest-cli.json для автоматической генерации из DTO: `"plugins": ["@nestjs/swagger"]`

- [ ] Task 7: CORS (AC: #7)
  - [ ] 7.1 Настроить app.enableCors({ origin: configService.get('CORS_ORIGIN') || 'http://localhost:3000' }) в main.ts
  - [ ] 7.2 Добавить CORS_ORIGIN в .env.example

- [ ] Task 8: API versioning и Health endpoint (AC: #8)
  - [ ] 8.1 Настроить globalPrefix 'api/v1' в main.ts — app.setGlobalPrefix('api/v1')
  - [ ] 8.2 Исключить Swagger из global prefix: app.setGlobalPrefix('api/v1', { exclude: ['/api/docs'] })  (или настроить Swagger path отдельно)
  - [ ] 8.3 Создать `apps/api/src/modules/health/health.controller.ts` — GET /api/v1/health возвращает { status: 'ok' }
  - [ ] 8.4 Создать `apps/api/src/modules/health/health.module.ts`
  - [ ] 8.5 Подключить HealthModule в app.module.ts

- [ ] Task 9: Кастомный Business Exception (AC: #4)
  - [ ] 9.1 Создать `apps/api/src/common/exceptions/business.exception.ts` — класс BusinessException extends HttpException, принимает { statusCode, message, errorCode: ErrorCode }
  - [ ] 9.2 Использует ErrorCode из @bmad-cem/shared

- [ ] Task 10: Верификация (AC: #1-8)
  - [ ] 10.1 `turbo dev` — apps/api стартует без ошибок, TypeORM подключается к PostgreSQL
  - [ ] 10.2 GET /api/v1/health → { data: { status: 'ok' }, meta: {} }
  - [ ] 10.3 GET /api/docs → Swagger UI открывается
  - [ ] 10.4 POST /api/v1/health (невалидный запрос) → проверить что ExceptionFilter и ValidationPipe работают
  - [ ] 10.5 Запрос с origin http://localhost:3000 → CORS пропускает
  - [ ] 10.6 `turbo build` проходит без ошибок

## Dev Notes

### Критические технические требования

**Версии пакетов (март 2026):**
- NestJS: 11.1.17 (@nestjs/core, @nestjs/common)
- TypeORM: 0.3.28
- @nestjs/typeorm: совместимая с NestJS 11
- @nestjs/config: совместимая с NestJS 11
- @nestjs/swagger: совместимая с NestJS 11
- class-validator: latest
- class-transformer: latest
- pg: latest (PostgreSQL driver)
- typeorm-naming-strategies: latest

**PostgreSQL (из Story 1.1 docker-compose):**
- Host: localhost, Port: 5432
- DB: bmad_cem, User: bmad, Password: bmad123

### Архитектурные решения

**AR4 — Strict layering:** Controller → Service → Repository + Mapper. В этой истории создаётся только инфраструктура — конкретных модулей нет. Health controller — исключение, минимальный.

**AR5 — API versioning:** Все эндпоинты под /api/v1/. Настраивается через `app.setGlobalPrefix('api/v1')`.

**AR6 — ValidationPipe:**
```typescript
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
})
```

**AR7 — Response wrapper:**
```typescript
// Все успешные ответы:
{ data: <response>, meta: {} }

// Списки с пагинацией (контроллер возвращает уже готовую структуру):
{ data: [...], meta: { page: 1, limit: 10, total: 42, totalPages: 5 } }
```

**AR8 — Error format:**
```typescript
// Все ошибки:
{ statusCode: 400, message: "Human-readable message", errorCode: "VALIDATION_ERROR" }
```

**AR10 — Swagger:** Доступен на /api/docs. Плагин `@nestjs/swagger` в nest-cli.json для авто-генерации из DTO.

**AR12 — CORS:** enableCors с whitelist origin из ConfigService.

**AR14 — TypeORM synchronize: true** (без миграций на MVP).

**Naming strategy:** TypeORM SnakeNamingStrategy трансформирует camelCase entity fields → snake_case колонки в БД. Например, `createdAt` → `created_at`.

**database.config.ts:**
```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get('DB_HOST'),
    port: config.getOrThrow<number>('DB_PORT'),
    database: config.get('DB_NAME'),
    username: config.get('DB_USER'),
    password: config.get('DB_PASSWORD'),
    autoLoadEntities: true,
    synchronize: true,
    namingStrategy: new SnakeNamingStrategy(),
  }),
})
```

**BusinessException — кастомный HttpException:**
```typescript
import { ErrorCode } from '@bmad-cem/shared';

export class BusinessException extends HttpException {
  constructor(statusCode: number, message: string, errorCode: ErrorCode) {
    super({ statusCode, message, errorCode }, statusCode);
  }
}
```

**ResponseWrapper interceptor — логика:**
- Если response === null или undefined → { data: null, meta: {} }
- Если response имеет поля data и meta → пробросить as-is (для пагинированных ответов)
- Иначе → { data: response, meta: {} }

**main.ts — порядок настройки:**
1. app.setGlobalPrefix('api/v1')
2. app.enableCors(...)
3. app.useGlobalPipes(new ValidationPipe(...))
4. app.useGlobalFilters(new HttpExceptionFilter())
5. app.useGlobalInterceptors(new ResponseWrapperInterceptor())
6. SwaggerModule.setup(...)
7. app.listen(3001)

### ЗАПРЕТЫ (anti-patterns)

- НЕ создавать доменные модули (auth, survey, question) — это Stories 1.4 и далее
- НЕ создавать Entity-классы — это Story 1.4+
- НЕ устанавливать @nestjs/jwt, passport, bcrypt — это Story 1.4
- НЕ создавать JwtAuthGuard, @Public() декоратор — это Story 1.4
- НЕ использовать `any` type
- НЕ бросать строки вместо exceptions
- НЕ возвращать Entity напрямую из API
- НЕ размещать SQL/QueryBuilder в сервисном слое
- НЕ хардкодить error messages без errorCode
- НЕ коммитить .env файлы

### Previous Story Context

**Story 1.1 создала:**
- Monorepo (Turborepo + pnpm workspaces)
- apps/api (NestJS 11, порт 3001)
- apps/web (Next.js 16, порт 3000)
- packages/shared (пустой barrel export)
- Docker Compose с PostgreSQL (localhost:5432, bmad_cem)
- .env.example с DB_* и JWT_* переменными

**Story 1.2 создала:**
- packages/shared с enums: ErrorCode, SurveyStatus, QuestionType, RespondentStatus
- DTO-интерфейсы: ICreateSurveyDto, IApiResponse<T>, IApiError и другие
- Типы: ISurveyFlow, IFlowNode, IFlowEdge
- Flow-validator pure functions
- Barrel export через index.ts

**Эта история использует:** ErrorCode enum из @bmad-cem/shared в ExceptionFilter и BusinessException.

### Project Structure Notes

```
apps/api/src/
├── main.ts                          # Bootstrap: prefix, CORS, pipes, filters, interceptors, Swagger
├── app.module.ts                    # Root: ConfigModule, TypeOrmModule, HealthModule
├── config/
│   └── database.config.ts           # TypeORM config from env
├── common/
│   ├── exceptions/
│   │   └── business.exception.ts    # BusinessException extends HttpException
│   ├── filters/
│   │   └── http-exception.filter.ts # Глобальный ExceptionFilter
│   ├── interceptors/
│   │   └── response-wrapper.interceptor.ts  # { data, meta } wrapper
│   └── pipes/
│       └── validation.pipe.ts       # ValidationPipe config (можно inline в main.ts)
└── modules/
    └── health/
        ├── health.module.ts
        └── health.controller.ts     # GET /api/v1/health
```

### References

- [Source: planning-artifacts/architecture.md § API & Communication Patterns]
- [Source: planning-artifacts/architecture.md § Backend Architecture — Strict layering]
- [Source: planning-artifacts/architecture.md § Process Patterns — Error Handling]
- [Source: planning-artifacts/architecture.md § Infrastructure & Deployment]
- [Source: planning-artifacts/architecture.md § Format Patterns — API Response Format]
- [Source: planning-artifacts/epics.md § Story 1.3: Backend bootstrap — глобальные паттерны NestJS]
- [Source: planning-artifacts/architecture.md § AR4-AR10, AR12, AR14]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
