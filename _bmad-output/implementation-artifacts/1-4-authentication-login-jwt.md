# Story 1.4: Аутентификация — логин и JWT

Status: ready-for-dev

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

- [ ] Task 1: Установка зависимостей (AC: #1-6)
  - [ ] 1.1 `pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt` в apps/api
  - [ ] 1.2 `pnpm add -D @types/passport-jwt @types/bcrypt` в apps/api

- [ ] Task 2: User entity и seed (AC: #1)
  - [ ] 2.1 Создать `apps/api/src/modules/auth/entities/user.entity.ts` — Entity User { id: number (PK auto), login: string (unique), passwordHash: string, createdAt: Date }
  - [ ] 2.2 Создать `apps/api/src/config/seed.ts` — функция seedDefaultUser: проверяет count пользователей, если 0 → создаёт admin с bcrypt.hash('123', 10)
  - [ ] 2.3 Вызвать seedDefaultUser в main.ts после app bootstrap (или в onModuleInit AuthModule)

- [ ] Task 3: AuthModule — backend (AC: #2, #3)
  - [ ] 3.1 Создать `apps/api/src/modules/auth/auth.module.ts` — imports: JwtModule.registerAsync, PassportModule, TypeOrmModule.forFeature([User])
  - [ ] 3.2 Создать `apps/api/src/modules/auth/auth.service.ts` — validateUser(login, password): проверка bcrypt.compare, generateToken(user): jwt.sign с payload { sub: user.id, login: user.login }
  - [ ] 3.3 Создать `apps/api/src/modules/auth/dto/login.dto.ts` — LoginDto { login: string (@IsString, @IsNotEmpty), password: string (@IsString, @IsNotEmpty) }
  - [ ] 3.4 Создать `apps/api/src/modules/auth/auth.controller.ts` — POST /auth/login: принимает LoginDto, вызывает authService.validateUser, возвращает { accessToken }
  - [ ] 3.5 При невалидных credentials — бросать BusinessException(401, '...', ErrorCode.AUTH_INVALID_CREDENTIALS)

- [ ] Task 4: JWT Strategy и Guard (AC: #4, #5, #6)
  - [ ] 4.1 Создать `apps/api/src/modules/auth/strategies/jwt.strategy.ts` — PassportStrategy(Strategy, 'jwt'), извлечение secret из ConfigService, validate(payload) → { userId: payload.sub, login: payload.login }
  - [ ] 4.2 Создать `apps/api/src/common/guards/jwt-auth.guard.ts` — extends AuthGuard('jwt'), override canActivate: проверяет метаданные IS_PUBLIC_KEY, если @Public() → пропускает
  - [ ] 4.3 Создать `apps/api/src/common/decorators/public.decorator.ts` — SetMetadata(IS_PUBLIC_KEY, true)
  - [ ] 4.4 Зарегистрировать JwtAuthGuard глобально через APP_GUARD provider в AuthModule (или app.module.ts)
  - [ ] 4.5 Добавить @Public() на health endpoint (GET /api/v1/health)
  - [ ] 4.6 Добавить @Public() на auth/login endpoint

- [ ] Task 5: JwtModule configuration (AC: #2)
  - [ ] 5.1 Настроить JwtModule.registerAsync в AuthModule: secret из ConfigService.get('JWT_SECRET'), signOptions: { expiresIn: ConfigService.get('JWT_EXPIRES_IN') || '24h' }

- [ ] Task 6: Frontend — API client (AC: #7, #8)
  - [ ] 6.1 Создать `apps/web/src/lib/apiClient.ts` — fetch/axios wrapper с базовым URL http://localhost:3001/api/v1, автоматическое добавление Authorization: Bearer header из хранилища токена
  - [ ] 6.2 Хранение токена: localStorage (ключ 'accessToken')
  - [ ] 6.3 При 401 ответе от API — удалить токен и редиректить на /login

- [ ] Task 7: Frontend — страница логина (AC: #7)
  - [ ] 7.1 Создать `apps/web/src/app/login/page.tsx` — форма с полями login (Input) и password (Input type="password"), кнопка "Войти" (Button Primary)
  - [ ] 7.2 Обработка submit: POST /auth/login через apiClient, при успехе — сохранить accessToken в localStorage, router.push('/dashboard')
  - [ ] 7.3 При ошибке — inline-сообщение под формой (текст красный, rose-400 border)
  - [ ] 7.4 Валидация: оба поля обязательны, кнопка disabled при пустых полях или в процессе отправки
  - [ ] 7.5 Центрированная карточка на slate-50 фоне, минимальный layout без sidebar

- [ ] Task 8: Frontend — защита маршрутов (AC: #8)
  - [ ] 8.1 Создать `apps/web/src/hooks/useAuth.ts` — проверка наличия токена в localStorage, функции login/logout, isAuthenticated
  - [ ] 8.2 Создать middleware или AuthProvider для (admin) route group — если нет токена → redirect на /login
  - [ ] 8.3 В `apps/web/src/app/(admin)/layout.tsx` — обернуть в AuthGuard (клиентская проверка), при отсутствии токена → redirect
  - [ ] 8.4 На странице /login: если токен есть и валиден → redirect на /dashboard

- [ ] Task 9: Верификация (AC: #1-8)
  - [ ] 9.1 `turbo dev` → apps/api стартует, seed создаёт пользователя admin
  - [ ] 9.2 POST /api/v1/auth/login { login: "admin", password: "123" } → { data: { accessToken: "..." }, meta: {} }
  - [ ] 9.3 POST /api/v1/auth/login { login: "admin", password: "wrong" } → 401 { statusCode: 401, message: "...", errorCode: "AUTH_INVALID_CREDENTIALS" }
  - [ ] 9.4 GET /api/v1/health без токена → 200 (public)
  - [ ] 9.5 GET /api/v1/health с токеном → 200
  - [ ] 9.6 Повторный запуск — seed НЕ создаёт дубликат пользователя
  - [ ] 9.7 Открыть localhost:3000/login → форма логина
  - [ ] 9.8 Ввести admin/123 → redirect на /dashboard
  - [ ] 9.9 Открыть localhost:3000/dashboard без токена → redirect на /login

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

### Debug Log References

### Completion Notes List

### File List
