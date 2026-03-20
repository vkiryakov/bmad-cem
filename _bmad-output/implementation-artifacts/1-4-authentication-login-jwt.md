# Story 1.4: Аутентификация — логин и JWT

Status: review

## Story

As a пользователь,
I want войти в систему по логину и паролю и получить JWT-токен,
So that я могу безопасно работать с приложением.

## Acceptance Criteria

1. **Seed дефолтного пользователя**
   - Given приложение запущено впервые
   - When TypeORM синхронизирует схему
   - Then создаётся дефолтный пользователь (login: admin, password: 123 захеширован bcrypt)
   - And seed выполняется только если пользователей нет в БД (FR44)

2. **Успешный логин**
   - Given дефолтный пользователь создан
   - When POST /api/v1/auth/login с {login: "admin", password: "123"}
   - Then возвращается JWT access token со сроком жизни 24 часа
   - And ответ в формате {data: {accessToken: "..."}, meta: {}} (FR45)

3. **Невалидный логин**
   - Given невалидные credentials
   - When POST /api/v1/auth/login с неправильным паролем
   - Then возвращается 401 с errorCode AUTH_INVALID_CREDENTIALS

4. **Защищённые эндпоинты с JWT**
   - Given JWT token получен
   - When запрос к защищённому эндпоинту с Authorization: Bearer <token>
   - Then запрос проходит через JwtAuthGuard и обрабатывается

5. **Отсутствие JWT**
   - Given отсутствие или невалидный JWT token
   - When запрос к защищённому эндпоинту
   - Then возвращается 401 Unauthorized

6. **@Public() декоратор**
   - Given эндпоинт с декоратором @Public()
   - When запрос без JWT token
   - Then запрос обрабатывается без аутентификации (NFR9)

7. **Frontend: страница логина**
   - Given apps/web
   - When пользователь открывает страницу /login
   - Then отображается форма с полями логин и пароль и кнопкой "Войти"
   - And при успешном логине токен сохраняется и происходит редирект на /dashboard
   - And при ошибке отображается inline-сообщение об ошибке

8. **Frontend: защита маршрутов**
   - Given пользователь не аутентифицирован
   - When пытается открыть любую страницу (admin)/*
   - Then происходит редирект на /login

## Tasks / Subtasks

- [x] Task 1: Установка зависимостей (AC: #1-6)
  - [x] 1.1 pnpm add auth deps
  - [x] 1.2 pnpm add -D @types/passport-jwt @types/bcrypt

- [x] Task 2: User entity и seed (AC: #1)
  - [x] 2.1 user.entity.ts — User { id, login, passwordHash, createdAt }
  - [x] 2.2 seed.ts — seedDefaultUser (idempotent)
  - [x] 2.3 Seed вызывается в AuthModule.onModuleInit

- [x] Task 3: AuthModule — backend (AC: #2, #3)
  - [x] 3.1 auth.module.ts — JwtModule, PassportModule, TypeOrmModule
  - [x] 3.2 auth.service.ts — validateUser, generateToken
  - [x] 3.3 login.dto.ts — LoginDto
  - [x] 3.4 auth.controller.ts — POST /auth/login
  - [x] 3.5 BusinessException(401, AUTH_INVALID_CREDENTIALS)

- [x] Task 4: JWT Strategy и Guard (AC: #4, #5, #6)
  - [x] 4.1 jwt.strategy.ts — PassportStrategy
  - [x] 4.2 jwt-auth.guard.ts — AuthGuard с @Public() проверкой
  - [x] 4.3 public.decorator.ts — @Public()
  - [x] 4.4 APP_GUARD зарегистрирован в AuthModule
  - [x] 4.5 @Public() на health endpoint
  - [x] 4.6 @Public() на auth/login

- [x] Task 5: JwtModule configuration (AC: #2)
  - [x] 5.1 JwtModule.registerAsync с secret и expiresIn из ConfigService

- [x] Task 6: Frontend — API client (AC: #7, #8)
  - [x] 6.1 apiClient.ts — fetch wrapper
  - [x] 6.2 localStorage хранение токена
  - [x] 6.3 401 → remove token → redirect /login

- [x] Task 7: Frontend — страница логина (AC: #7)
  - [x] 7.1 login/page.tsx — форма с login/password
  - [x] 7.2 POST /auth/login → save token → /dashboard
  - [x] 7.3 Ошибка: text-rose-500
  - [x] 7.4 Disabled при пустых полях/loading
  - [x] 7.5 Центрированная карточка, slate-50 фон

- [x] Task 8: Frontend — защита маршрутов (AC: #8)
  - [x] 8.1 useAuth.ts — isAuthenticated, login, logout
  - [x] 8.2 (admin)/layout.tsx — AuthGuard wrapper
  - [x] 8.3 Redirect /login при отсутствии токена
  - [x] 8.4 Login page: redirect /dashboard при наличии токена

- [x] Task 9: Верификация (AC: #1-8)
  - [x] 9.1 API стартует, seed создаёт admin
  - [x] 9.2 Login success → {data: {accessToken}, meta: {}}
  - [x] 9.3 Login fail → 401 AUTH_INVALID_CREDENTIALS
  - [x] 9.4 Health public → 200
  - [x] 9.5 Health with token → 200
  - [x] 9.6 Seed idempotent
  - [x] 9.7-9.9 Frontend login page и route protection (build verified)

## Dev Notes

### Критические технические требования

**Версии пакетов (март 2026):**
- @nestjs/jwt: совместимая с NestJS 11
- @nestjs/passport: совместимая с NestJS 11
- passport-jwt: latest
- bcrypt: latest

**AR9 — JWT Auth:** Глобальный JwtAuthGuard + @Public() декоратор.

**AR11 — Seed:** Дефолтный пользователь admin/123 при первом запуске.

**AR17 — Stateless:** JWT access token 24h без refresh tokens. Токен содержит { sub: userId, login: userLogin }. Нет серверных сессий.

### Архитектурные решения

**JWT payload:**
```typescript
{
  sub: number;      // user.id
  login: string;    // user.login
  iat: number;      // issued at (автоматически)
  exp: number;      // expires (автоматически, 24h)
}
```

**Глобальный JwtAuthGuard с @Public() — паттерн:**
```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

**Регистрация глобального guard через provider (не через main.ts):**
```typescript
// app.module.ts или auth.module.ts
{ provide: APP_GUARD, useClass: JwtAuthGuard }
```
Это позволяет DI (Reflector) работать корректно.

**Seed — idempotent:**
```typescript
async function seedDefaultUser(userRepo: Repository<User>) {
  const count = await userRepo.count();
  if (count > 0) return;
  const user = userRepo.create({
    login: 'admin',
    passwordHash: await bcrypt.hash('123', 10),
  });
  await userRepo.save(user);
}
```

**User entity:**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  login: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
```
Примечание: naming strategy из Story 1.3 трансформирует `passwordHash` → `password_hash`, `createdAt` → `created_at` автоматически. Явный `name` опционален.

**Frontend: API client — паттерн:**
```typescript
const apiClient = {
  async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`http://localhost:3001/api/v1${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });
    if (res.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw await res.json();
    return res.json();
  }
};
```

**Frontend: login page — минимальный layout:**
- Фон: slate-50
- Карточка: white, shadow-sm, rounded-xl, max-width 400px, центрирована вертикально и горизонтально
- Заголовок: "Вход в систему" (h2, semibold)
- Поля: Input с label "Логин", Input type="password" с label "Пароль"
- Кнопка: "Войти" (Primary, full-width)
- Ошибка: текст под формой, text-rose-500

**Frontend: защита маршрутов — клиентская:**
Next.js App Router — проверка токена на клиенте. Можно использовать middleware.ts (edge) или AuthProvider в layout. Рекомендация: AuthProvider в (admin)/layout.tsx для простоты.

### ЗАПРЕТЫ (anti-patterns)

- НЕ использовать refresh tokens — AR17 требует только access token 24h
- НЕ хранить пароль в plain text — только bcrypt hash
- НЕ создавать rate limiting — отложено на post-MVP
- НЕ создавать регистрацию пользователей — только seed
- НЕ использовать серверные сессии — stateless JWT
- НЕ хардкодить JWT secret в коде — только через ConfigService/.env
- НЕ создавать sidebar, dashboard content, другие UI компоненты — это Story 1.5
- НЕ создавать доменные модули (survey, question) — это Epic 2+
- НЕ использовать cookies для хранения токена — localStorage
- НЕ использовать `any` type

### Previous Story Context

**Story 1.1 создала:** Monorepo, apps/web, apps/api, packages/shared, Docker Compose.

**Story 1.2 создала:** packages/shared с ErrorCode enum (AUTH_INVALID_CREDENTIALS, AUTH_UNAUTHORIZED), DTO-интерфейсы, типы.

**Story 1.3 создала:**
- ConfigModule (загрузка .env: DB_*, JWT_SECRET, JWT_EXPIRES_IN, CORS_ORIGIN)
- TypeORM подключение к PostgreSQL (synchronize: true, SnakeNamingStrategy)
- Глобальный ValidationPipe (whitelist: true, forbidNonWhitelisted: true)
- Глобальный ExceptionFilter (формат { statusCode, message, errorCode })
- ResponseWrapper interceptor ({ data, meta })
- BusinessException класс
- Swagger на /api/docs
- CORS для localhost:3000
- Health endpoint GET /api/v1/health
- API prefix /api/v1

**Эта история добавляет:** User entity, seed, AuthModule (login + JWT), JwtAuthGuard глобальный, @Public() декоратор, frontend login page, apiClient, защиту маршрутов.

### Project Structure Notes

**Backend — новые файлы:**
```
apps/api/src/
├── config/
│   └── seed.ts                       # seedDefaultUser function
├── common/
│   ├── decorators/
│   │   └── public.decorator.ts       # @Public()
│   └── guards/
│       └── jwt-auth.guard.ts         # Глобальный JwtAuthGuard
└── modules/
    └── auth/
        ├── auth.module.ts
        ├── auth.controller.ts        # POST /auth/login
        ├── auth.service.ts           # validateUser, generateToken
        ├── auth.service.spec.ts
        ├── strategies/
        │   └── jwt.strategy.ts       # PassportStrategy
        ├── dto/
        │   └── login.dto.ts          # LoginDto { login, password }
        └── entities/
            └── user.entity.ts        # User { id, login, passwordHash, createdAt }
```

**Frontend — новые файлы:**
```
apps/web/src/
├── app/
│   ├── login/
│   │   └── page.tsx                  # Страница логина
│   └── (admin)/
│       └── layout.tsx                # AuthGuard wrapper (redirect to /login)
├── hooks/
│   └── useAuth.ts                    # isAuthenticated, login, logout
└── lib/
    └── apiClient.ts                  # fetch wrapper с JWT header
```

### References

- [Source: planning-artifacts/architecture.md § Authentication & Security]
- [Source: planning-artifacts/architecture.md § AR9, AR11, AR17]
- [Source: planning-artifacts/architecture.md § Backend Architecture — Module structure: AuthModule]
- [Source: planning-artifacts/architecture.md § Frontend Structure — app/login/page.tsx, hooks/useAuth.ts]
- [Source: planning-artifacts/epics.md § Story 1.4: Аутентификация — логин и JWT]
- [Source: planning-artifacts/prd.md § FR44, FR45]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- JwtModule expiresIn type workaround: cast signOptions as Record<string, unknown> due to StringValue branded type from ms package

### Completion Notes List
- User entity с bcrypt hash и seed admin/123 (idempotent)
- AuthModule: login endpoint, JwtStrategy, глобальный JwtAuthGuard через APP_GUARD
- @Public() декоратор на health и auth/login
- Frontend: apiClient.ts fetch wrapper с JWT header и 401 handling
- Frontend: login page со стилем из story (slate-50, white card, rose-500 errors)
- Frontend: (admin) route group с redirect на /login при отсутствии токена
- 13 unit тестов (3 auth service + 10 existing) — все проходят
- E2E проверка: login success/fail, health public/auth, seed idempotent

### Change Log
- 2026-03-20: Story 1.4 — Auth module (login, JWT, seed, frontend login)

### File List
- apps/api/src/modules/auth/entities/user.entity.ts (создан)
- apps/api/src/modules/auth/auth.module.ts (создан)
- apps/api/src/modules/auth/auth.service.ts (создан)
- apps/api/src/modules/auth/auth.service.spec.ts (создан)
- apps/api/src/modules/auth/auth.controller.ts (создан)
- apps/api/src/modules/auth/dto/login.dto.ts (создан)
- apps/api/src/modules/auth/strategies/jwt.strategy.ts (создан)
- apps/api/src/common/guards/jwt-auth.guard.ts (создан)
- apps/api/src/common/decorators/public.decorator.ts (создан)
- apps/api/src/config/seed.ts (создан)
- apps/api/src/app.module.ts (изменён — AuthModule)
- apps/api/src/modules/health/health.controller.ts (изменён — @Public())
- apps/api/package.json (изменён — auth deps)
- apps/web/src/lib/apiClient.ts (создан)
- apps/web/src/hooks/useAuth.ts (создан)
- apps/web/src/app/login/page.tsx (создан)
- apps/web/src/app/(admin)/layout.tsx (создан)
- apps/web/src/app/(admin)/dashboard/page.tsx (создан)
