# Story 1.3: Backend bootstrap — глобальные паттерны NestJS

Status: review

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

- [x] Task 1: Установка зависимостей (AC: #1-6)
  - [x] 1.1 pnpm add all NestJS dependencies
  - [x] 1.2 pnpm add typeorm-naming-strategies
  - [x] 1.3 @bmad-cem/shared доступен как workspace-зависимость

- [x] Task 2: ConfigModule и database.config (AC: #1, #2)
  - [x] 2.1 Создан `apps/api/src/config/database.config.ts`
  - [x] 2.2 TypeOrmModule.forRootAsync в app.module.ts
  - [x] 2.3 synchronize: true, SnakeNamingStrategy
  - [x] 2.4 ConfigModule.forRoot({ isGlobal: true })
  - [x] 2.5 apps/api/.env создан
  - [x] 2.6 apps/api/.env.example создан

- [x] Task 3: Глобальный ValidationPipe (AC: #3)
  - [x] 3.1 Создан validation.pipe.ts
  - [x] 3.2 Зарегистрирован глобально в main.ts

- [x] Task 4: Глобальный ExceptionFilter (AC: #4)
  - [x] 4.1 Создан http-exception.filter.ts
  - [x] 4.2 Обработка HttpException с errorCode
  - [x] 4.3 Обработка ValidationPipe ошибок (VALIDATION_ERROR)
  - [x] 4.4 Обработка неизвестных ошибок (500, INTERNAL_ERROR)
  - [x] 4.5 Зарегистрирован глобально в main.ts

- [x] Task 5: ResponseWrapper interceptor (AC: #5)
  - [x] 5.1 Создан response-wrapper.interceptor.ts
  - [x] 5.2 Оборачивает ответы в { data, meta }
  - [x] 5.3 Пробрасывает as-is для { data, meta } структур
  - [x] 5.4 Зарегистрирован глобально в main.ts

- [x] Task 6: Swagger (AC: #6)
  - [x] 6.1 SwaggerModule настроен на /api/docs
  - [x] 6.2 Plugin добавлен в nest-cli.json

- [x] Task 7: CORS (AC: #7)
  - [x] 7.1 enableCors с CORS_ORIGIN из ConfigService
  - [x] 7.2 CORS_ORIGIN в .env.example

- [x] Task 8: API versioning и Health endpoint (AC: #8)
  - [x] 8.1 globalPrefix 'api/v1'
  - [x] 8.2 Swagger path настроен отдельно от prefix
  - [x] 8.3 health.controller.ts — GET /api/v1/health
  - [x] 8.4 health.module.ts
  - [x] 8.5 HealthModule подключён в app.module.ts

- [x] Task 9: Кастомный Business Exception (AC: #4)
  - [x] 9.1 business.exception.ts — BusinessException extends HttpException
  - [x] 9.2 Использует ErrorCode из @bmad-cem/shared

- [x] Task 10: Верификация (AC: #1-8)
  - [x] 10.1 API стартует, TypeORM подключается к PostgreSQL
  - [x] 10.2 GET /api/v1/health → {"data":{"status":"ok"},"meta":{}}
  - [x] 10.3 GET /api/docs → Swagger UI
  - [x] 10.4 ExceptionFilter и ValidationPipe работают (тесты)
  - [x] 10.5 CORS: Access-Control-Allow-Origin: http://localhost:3000
  - [x] 10.6 turbo build проходит без ошибок

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
Claude Opus 4.6

### Debug Log References
- Shared package переведён на CommonJS для совместимости с NestJS runtime (main → dist/index.js)

### Completion Notes List
- ConfigModule + TypeORM настроены с SnakeNamingStrategy и synchronize: true
- ValidationPipe: whitelist, forbidNonWhitelisted, transform
- HttpExceptionFilter: BusinessException errorCode, ValidationPipe ошибки, generic 500
- ResponseWrapperInterceptor: { data, meta } обёртка с passthrough для paginated
- Swagger на /api/docs с plugin для авто-документации
- CORS: origin из CORS_ORIGIN env
- Health endpoint: GET /api/v1/health → {"data":{"status":"ok"},"meta":{}}
- BusinessException: кастомный HttpException с ErrorCode
- 7 unit тестов: health controller, exception filter (3), response wrapper (3)

### Change Log
- 2026-03-20: Story 1.3 — NestJS global patterns (config, pipes, filters, interceptors, swagger, cors, health)

### File List
- apps/api/src/main.ts (переписан)
- apps/api/src/app.module.ts (переписан)
- apps/api/src/config/database.config.ts (создан)
- apps/api/src/common/pipes/validation.pipe.ts (создан)
- apps/api/src/common/filters/http-exception.filter.ts (создан)
- apps/api/src/common/filters/http-exception.filter.spec.ts (создан)
- apps/api/src/common/interceptors/response-wrapper.interceptor.ts (создан)
- apps/api/src/common/interceptors/response-wrapper.interceptor.spec.ts (создан)
- apps/api/src/common/exceptions/business.exception.ts (создан)
- apps/api/src/modules/health/health.controller.ts (создан)
- apps/api/src/modules/health/health.controller.spec.ts (создан)
- apps/api/src/modules/health/health.module.ts (создан)
- apps/api/nest-cli.json (изменён — swagger plugin)
- apps/api/.env (создан)
- apps/api/.env.example (создан)
- apps/api/package.json (изменён — новые зависимости)
- apps/api/src/app.controller.ts (удалён)
- apps/api/src/app.service.ts (удалён)
- apps/api/src/app.controller.spec.ts (удалён)
- packages/shared/package.json (изменён — build скрипт, main → dist)
- packages/shared/tsconfig.json (изменён — CommonJS)
