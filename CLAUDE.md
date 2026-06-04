# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

- Use comments sparingly — only on complex or non-obvious code. Skip comments on straightforward logic.

## What is UIGen

An AI-powered React component generator with live preview. Users describe components in natural language; Claude generates React/Tailwind code in real-time, visible in an in-browser preview.

## Commands

```bash
# First-time setup
npm run setup           # installs deps, generates Prisma client, runs migrations

# Development
npm run dev             # Next.js dev server with Turbopack

# Build & start
npm run build
npm run start

# Lint
npm run lint

# Tests (Vitest)
npm test                # run all tests
npx vitest run src/lib/__tests__/file-system.test.ts   # single test file

# Database
npm run db:reset        # reset and re-migrate SQLite DB
npx prisma studio       # browse DB in browser
```

`dev`/`build`/`start` all require the `NODE_OPTIONS='--require ./node-compat.cjs'` prefix (already included in npm scripts).

## Environment

Copy `.env` and set:
- `ANTHROPIC_API_KEY` — optional; when absent, mock mode returns static component templates instead of calling Claude.

## Architecture

### Request flow

1. User types in `ChatInterface` → message sent to `/api/chat` (streaming POST)
2. API route calls `streamText()` (Vercel AI SDK) with the Claude model and two tools
3. Claude calls `str_replace_editor` (create/update files) or `file_manager` (delete/list)
4. Tool results update `VirtualFileSystem` (in-memory); changes propagate via `FileSystemContext`
5. `PreviewFrame` rebuilds the preview iframe from the updated virtual file system

### State management

Two React contexts wrap the app (see `src/app/[projectId]/page.tsx`):

- **`FileSystemContext`** (`src/lib/contexts/file-system.tsx`): owns `VirtualFileSystem`, exposes file CRUD
- **`ChatContext`** (`src/lib/contexts/chat.tsx`): owns chat messages, calls the `/api/chat` route, syncs file system updates from AI tool calls

No external state library — context + hooks is sufficient.

### Virtual file system

`src/lib/file-system.ts` — `VirtualFileSystem` class holds an in-memory tree. Nothing is written to disk. For authenticated users, the serialized state is persisted in the `Project.data` JSON column via Prisma.

### AI tools

Defined in `src/lib/tools/`:
- `str_replace_editor` — creates/edits files (str-replace or full-write)
- `file_manager` — deletes files, lists directory

The system prompt instructing Claude on React/Tailwind conventions lives in `src/lib/prompts/generation.tsx`.

### Database (Prisma + SQLite)

Schema in `prisma/schema.prisma`. Two models: `User` and `Project`. `Project.messages` and `Project.data` are JSON stored as strings. Run `npx prisma generate` after schema changes.

### Key path alias

`@/*` maps to `./src/*` (set in `tsconfig.json`).

### UI library

shadcn/ui components (Radix UI primitives + Tailwind CSS v4). New components are added via `npx shadcn@latest add <component>`. Base components live in `src/components/ui/`.

### Authentication

JWT sessions (jose) with bcrypt passwords. Server actions in `src/actions/` handle sign-up/sign-in/sign-out. `src/middleware.ts` protects the `/api/chat` route for authenticated operations. The app also works anonymously (no persistence).
