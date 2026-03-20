# Story 1.1: Инициализация monorepo и инфраструктуры

Status: ready-for-dev

## Story

As a разработчик,
I want настроенный monorepo с работающими frontend, backend и базой данных,
So that я могу начать разработку фич на правильном фундаменте.

## Acceptance Criteria

1. **Monorepo создан через create-turbo + CLI**
   - Given пустая директория проекта
   - When выполнены команды инициализации
   - Then создана структура: apps/web (Next.js 16), apps/api (NestJS 11), packages/shared, packages/config
   - And pnpm-workspace.yaml корректно определяет все workspace-пакеты
   - And turbo.json настроен с pipeline для dev, build, lint

2. **PostgreSQL через Docker Compose**
   - Given настроенный monorepo
   - When запускается `docker compose up -d`
   - Then PostgreSQL доступен на localhost:5432

3. **Dev-сервер работает**
   - Given PostgreSQL запущен
   - When запускается `turbo dev`
   - Then apps/web доступен на localhost:3000
   - And apps/api доступен на localhost:3001
   - And оба приложения работают с hot reload

4. **Shared пакет подключён**
   - Given monorepo структура
   - When проверяется packages/shared
   - Then пакет экспортируется как @bmad-cem/shared
   - And импортируется обоими apps без ошибок

5. **TypeScript strict mode**
   - Given monorepo структура
   - When проверяются конфигурации TypeScript
   - Then strict mode включён во всех пакетах
   - And packages/config содержит базовые tsconfig (base, nextjs, nestjs)

## Tasks / Subtasks

- [ ] Task 1: Инициализация Turborepo monorepo (AC: #1)
  - [ ] 1.1 `npx create-turbo@latest bmad-cem --package-manager=pnpm`
  - [ ] 1.2 Очистить дефолтные apps из create-turbo (удалить шаблонные apps)
  - [ ] 1.3 Настроить pnpm-workspace.yaml: apps/*, packages/*
  - [ ] 1.4 Настроить turbo.json pipeline: dev, build, lint, type-check

- [ ] Task 2: Инициализация Next.js frontend (AC: #1, #3)
  - [ ] 2.1 `npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --use-pnpm`
  - [ ] 2.2 `cd apps/web && npx shadcn@latest init` (shadcn/ui v4)
  - [ ] 2.3 Настроить package.json: name = "@bmad-cem/web"
  - [ ] 2.4 Добавить зависимость на @bmad-cem/shared в package.json
  - [ ] 2.5 Убедиться что dev-скрипт запускает на порту 3000

- [ ] Task 3: Инициализация NestJS backend (AC: #1, #3)
  - [ ] 3.1 `npx @nestjs/cli new apps/api --package-manager=pnpm --strict`
  - [ ] 3.2 Настроить package.json: name = "@bmad-cem/api"
  - [ ] 3.3 Добавить зависимость на @bmad-cem/shared
  - [ ] 3.4 Настроить dev-скрипт на порт 3001
  - [ ] 3.5 Удалить дефолтный .git из apps/api (NestJS CLI создаёт свой)

- [ ] Task 4: Создание packages/shared (AC: #4)
  - [ ] 4.1 Создать packages/shared/package.json (name: "@bmad-cem/shared")
  - [ ] 4.2 Создать packages/shared/tsconfig.json (extends base config)
  - [ ] 4.3 Создать packages/shared/src/index.ts (пустой barrel export)
  - [ ] 4.4 Проверить что apps/web и apps/api могут импортировать @bmad-cem/shared

- [ ] Task 5: Создание packages/config (AC: #5)
  - [ ] 5.1 Создать packages/config/typescript/base.json (strict: true, esModuleInterop: true, resolveJsonModule: true, skipLibCheck: true)
  - [ ] 5.2 Создать packages/config/typescript/nextjs.json (extends base + jsx: preserve, module: esnext)
  - [ ] 5.3 Создать packages/config/typescript/nestjs.json (extends base + experimentalDecorators: true, emitDecoratorMetadata: true)
  - [ ] 5.4 Создать packages/config/eslint/index.js (базовая конфигурация)

- [ ] Task 6: Docker Compose для PostgreSQL (AC: #2)
  - [ ] 6.1 Создать docker-compose.yml с сервисом postgres (image: postgres:17, port: 5432)
  - [ ] 6.2 Создать .env.example с DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  - [ ] 6.3 Добавить docker-compose volumes для persistence данных
  - [ ] 6.4 Добавить healthcheck для postgres сервиса

- [ ] Task 7: Конфигурация корневых файлов (AC: #1)
  - [ ] 7.1 Настроить .gitignore (node_modules, dist, .next, .env, .turbo)
  - [ ] 7.2 Создать .env.example в корне
  - [ ] 7.3 Проверить `turbo dev` запускает оба apps параллельно

- [ ] Task 8: Верификация (AC: #1-5)
  - [ ] 8.1 `pnpm install` проходит без ошибок
  - [ ] 8.2 `docker compose up -d` запускает PostgreSQL
  - [ ] 8.3 `turbo dev` запускает web:3000 и api:3001
  - [ ] 8.4 `turbo build` собирает оба apps
  - [ ] 8.5 Импорт @bmad-cem/shared работает в обоих apps

## Dev Notes

### Критические технические требования

**Версии пакетов (подтверждено npm registry, март 2026):**
- Next.js: 16.2.0
- NestJS: 11.1.17 (@nestjs/core), @nestjs/cli: 11.0.16
- Turborepo: 2.8.20
- @xyflow/react: 12.10.1 (НЕ УСТАНАВЛИВАТЬ в этой истории — Epic 3)
- TypeORM: 0.3.28 (НЕ УСТАНАВЛИВАТЬ в этой истории — Story 1.3)
- shadcn/cli: v4
- pnpm: 10.32.1
- TypeScript: 5.x

**Команды инициализации (проверены --help):**

```bash
# 1. Monorepo
npx create-turbo@latest bmad-cem --package-manager=pnpm

# 2. Frontend (в корне monorepo, после очистки дефолтных apps)
npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --use-pnpm

# 3. shadcn/ui
cd apps/web && npx shadcn@latest init

# 4. Backend
npx @nestjs/cli new apps/api --package-manager=pnpm --strict
```

**create-next-app@16.2.0 поддерживает флаги:** `--typescript`, `--tailwind`, `--eslint`, `--app`, `--src-dir`, `--use-pnpm` — все подтверждены.

**create-turbo@2.8.20 поддерживает:** `--package-manager=pnpm`, `--skip-install`, `--no-git`.

### Архитектурные решения из architecture.md

**Структура monorepo (AR1):**
```
bmad-cem/
├── apps/
│   ├── web/          # Next.js 16 (порт 3000)
│   └── api/          # NestJS 11 (порт 3001)
├── packages/
│   ├── shared/       # @bmad-cem/shared — ТОЛЬКО интерфейсы, enums, types, pure functions
│   └── config/       # Общие tsconfig, eslint конфиги
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**packages/shared — ТОЛЬКО интерфейсы (AR3):**
- Никаких классов, декораторов, зависимостей от фреймворков
- Только `interface`, `type`, `enum` и pure functions
- В этой истории: создать пустой пакет с barrel export (src/index.ts)
- Наполнение контрактами — Story 1.2

**TypeScript strict mode обязателен во всех пакетах.**

### Docker Compose

```yaml
# docker-compose.yml — ТОЛЬКО PostgreSQL
services:
  postgres:
    image: postgres:17
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${DB_USER:-bmad}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-bmad123}
      POSTGRES_DB: ${DB_NAME:-bmad_cem}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bmad"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Именование пакетов (из architecture.md)

- apps/web → `@bmad-cem/web`
- apps/api → `@bmad-cem/api`
- packages/shared → `@bmad-cem/shared`
- packages/config → `@bmad-cem/config`

### turbo.json pipeline

```json
{
  "pipeline": {
    "dev": { "cache": false, "persistent": true },
    "build": { "dependsOn": ["^build"] },
    "lint": {},
    "type-check": {}
  }
}
```

### ЗАПРЕТЫ (anti-patterns)

- НЕ устанавливать TypeORM, @nestjs/jwt, passport, class-validator — это Story 1.3 и 1.4
- НЕ создавать модули NestJS (auth, survey и т.д.) — это следующие истории
- НЕ добавлять Zustand, React Query, React Hook Form — это Epic 2+
- НЕ создавать страницы, компоненты, хуки — это Story 1.5
- Эта история — ТОЛЬКО scaffold и инфраструктура
- НЕ использовать `any` type
- НЕ коммитить .env файлы (только .env.example)

### .env.example (корень проекта)

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bmad_cem
DB_USER=bmad
DB_PASSWORD=bmad123

# JWT (Story 1.4)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Project Structure Notes

- Структура полностью соответствует architecture.md § "Complete Project Directory Structure"
- packages/config содержит 3 tsconfig: base.json, nextjs.json, nestjs.json
- create-turbo создаёт свои шаблонные apps — их нужно удалить и заменить на create-next-app и nest new

### References

- [Source: planning-artifacts/architecture.md § Starter Template Evaluation — Initialization Commands]
- [Source: planning-artifacts/architecture.md § Complete Project Directory Structure]
- [Source: planning-artifacts/architecture.md § Infrastructure & Deployment]
- [Source: planning-artifacts/architecture.md § Shared Package Contract: Interfaces Only]
- [Source: planning-artifacts/epics.md § Story 1.1: Инициализация monorepo и инфраструктуры]
- [Source: planning-artifacts/architecture.md § Core Architectural Decisions — AR1-AR3]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
